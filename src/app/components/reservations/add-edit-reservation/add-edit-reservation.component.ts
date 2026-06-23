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
  selector: 'app-add-edit-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, BusesComponent, TripsForReservationComponent, NgTemplateOutlet, ShowReservationComponent, DatePipe, DatePickerComponent],
  templateUrl: './add-edit-reservation.component.html',
  styleUrl: './add-edit-reservation.component.scss'
})
export class AddEditReservationComponent {

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
  @ViewChild('residence_to_date_input') dateInput!: ElementRef<HTMLInputElement>;


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
  // set_min_return_date() {
  //   if (this.trip_type_selected_id == '4' && this.residence_form.get('residence_from_date')?.value) {
  //     // جِب قيمة التاريخ من الفورم (تأتي كنص ISO)
  //     const rawDate = this.residence_form.get('residence_from_date')?.value;
  //     // حوِّلها إلى كائن Date (تبقى UTC لأن القيمة فيها ‎Z‎)
  //     const date = new Date(rawDate);
  //     // أضِف يومين
  //     date.setUTCDate(date.getUTCDate() + 1);
  //     // احفظ أقل تاريخ مسموح به للعودة بصيغة YYYY‑MM‑DD
  //     this.min_return_date = date.toISOString().split('T')[0];
  //   }
  // }
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
    const id = this.activatedRoute.snapshot.paramMap.get('trip_id');
    if (id) {
      this.trip_selected_from_trips_page = id;
      this.tripsService.get_trip_by_id(this.trip_selected_from_trips_page).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.closed_trip_selected = res.data;
            this.trip_type_selected_id = this.trip_type_selected = '5';
          }
        }
      })
    }
    this.residence_form = this.formBuilder.group({
      residence_from_date: [null, Validators.required],
      residence_to_date: [null, Validators.required],
      stay_type: [null, Validators.required],
      hotel_id: [null, Validators.required],
      unit_type: [null, Validators.required],
      // room_count: [null],
      // bed_count: [null],
    });

    // this.residence_form.get('unit_type')?.valueChanges.subscribe(value => {
    //   const roomControl = this.residence_form.get('room_count');
    //   const bedControl = this.residence_form.get('bed_count');
    //   if (value == '2') {
    //     // added by shaaban =============================================================
    //     roomControl?.setValue(1);
    //     roomControl?.setValidators([Validators.required, Validators.min(1)]);
    //     bedControl?.setValue(this.users.length);
    //     // bedControl?.setValidators([Validators.required, Validators.min(this.users.length)]);
    //     // added by shaaban =============================================================
    //   } else {
    //     roomControl?.clearValidators();
    //     bedControl?.clearValidators();
    //   }
    //   roomControl?.updateValueAndValidity();
    //   bedControl?.updateValueAndValidity();
    // });

    // this.residence_form.get('unit_type')?.valueChanges.subscribe(value => {
    //   const roomsFormArray = this.residence_form.get('rooms') as FormArray;

    //   if (value == '2') {
    //     // إعادة تعيين الـ FormArray
    //     while (roomsFormArray.length !== 0) {
    //       roomsFormArray.removeAt(0);
    //     }
    //     this.rooms_data = [];

    //     // إضافة غرفة واحدة افتراضياً
    //     this.add_room();
    //   } else {
    //     // مسح جميع الغرف
    //     while (roomsFormArray.length !== 0) {
    //       roomsFormArray.removeAt(0);
    //     }
    //     this.rooms_data = [];
    //   }
    // });

    this.residence_form.get('unit_type')?.valueChanges.subscribe(value => {
      if (value == '2') {
        // إعادة تعيين عدادات الغرف
        this.roomTypeCounts = {};
      } else {
        // مسح البيانات
        this.roomTypeCounts = {};
      }
    });


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

  }


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

  // residence_from_date!: Date;
  // residence_to_date!: Date;
  select_trip_type(trip_type_id: string) {
    this.reset_step_3();
    if (trip_type_id == '4' || trip_type_id == '5' || trip_type_id == '10') {
      this.open_trip_type_selected = '';
    }
    if (trip_type_id == '4') {
      this.residence_type_selected_id = 1;
    }
    this.trip_type_selected_id = trip_type_id;
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
    "moneyPaid": 0,
    "busChairPrice": null,
    "returnBusChairPrice": null,
    "customersIds": [],
    "employeeId": "e7281d7a-fbe3-4d13-81eb-b57100fe3891",
    "paymentType": 2,
    "paymentMethod": null,
    "residenceDto": null,
    "ticketDto": null,
    "notes": ""
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
        if (this.trip_type_selected_id == '4') {
          this.reservation_data.show_data.trip_type = this.trip_type_selected_id;
          this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
          this.active_step = step;
          this.completed_steps[1] = true;
          this.get_all_hotels();
        }
        else if (this.trip_type_selected_id && this.trip_type_selected_id != '4' && this.trip_type_selected_id != '10') {
          // تحديد نوع الحجز
          // this.completed_steps[1] = true;
          // this.active_step = step;
          this.reservation_data.show_data.trip_type = this.trip_type_selected_id;
          //this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
          console.log(this.show_reservation_details);
          // رحلة مفتوحة ذهاب والترانزيت
          if (this.trip_type_selected_id == '1' || this.trip_type_selected_id == '6') {

            if (this.open_going_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length) {
              // const go_date = new Date(this.go_date);
              // go_date.setHours(0, 0, 0, 0);
              // if (this.residence_type_selected_id != 1 || (this.residence_type_selected_id == 1 && this.residence_form.valid && go_date <= this.residence_from_date)) {

              this.set_open_going_trip_data();
              if (this.trip_type_selected_id == '6') {
                this.active_step = step + 1;
                this.completed_steps[1] = true;
                this.completed_steps[2] = true;
              }
              else {
                this.active_step = step;
                this.completed_steps[1] = true;
              }
              // }
              // else {
              //   Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
              // }
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
              // const return_date = new Date(this.return_date);
              // return_date.setHours(0, 0, 0, 0)
              // if (this.residence_type_selected_id != 1 || (this.residence_type_selected_id == 1 && this.residence_form.valid && return_date >= this.residence_to_date)) {
              this.set_open_return_trip_data();
              this.active_step = step + 1;
              this.completed_steps[1] = true;
              this.completed_steps[2] = true;
              // }
              // else {
              //   Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
              // }
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
              // const go_date = new Date(this.go_date);
              // const return_date = new Date(this.return_date);
              // go_date.setHours(0, 0, 0, 0);
              // return_date.setHours(0, 0, 0, 0);
              // if (this.residence_type_selected_id != 1 || (this.residence_type_selected_id == 1 && this.residence_form.valid && go_date <= this.residence_from_date && return_date >= this.residence_to_date)) {
              this.set_open_going_return_trip_data();
              this.active_step = step;
              this.completed_steps[1] = true;
              // }
              // else {
              //   Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
              // }
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
              // const departureTime = new Date(this.closed_trip_selected.departureTime);
              // const returnTime = new Date(this.closed_trip_selected.returnTime);
              // departureTime.setHours(0, 0, 0, 0);
              // returnTime.setHours(0, 0, 0, 0);
              // if (this.residence_type_selected_id != 1 || (this.residence_type_selected_id == 1 && this.residence_form.valid && departureTime <= this.residence_from_date && returnTime >= this.residence_to_date)) {
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
        //this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
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
            this.reservation_data.residenceDto = {
              fromDate: this.formatDateOnly(this.residence_form.get('residence_from_date')?.value),
              toDate: this.formatDateOnly(this.residence_form.get('residence_to_date')?.value),
              stayType: Number(this.residence_form.get('stay_type')?.value),
              hotelId: this.residence_form.get('hotel_id')?.value,
              accommodationUnitType: Number(this.residence_form.get('unit_type')?.value),
              bedPrice: 0,
              roomPrice: 0,
              reservedRooms: []
            }
            // if (this.residence_form.get('unit_type')?.value == '2') {
            //   const roomsData = this.residence_form.get('rooms')?.value || [];
            //   this.reservation_data.residenceDto.reservedRooms = roomsData.map((room: any) => ({
            //     type: Number(room.bedsCount), // نوع الغرفة = عدد السراير
            //     roomsCount: Number(room.roomsCount)
            //   }));
            // }

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
            // this.residence_from_date = new Date(this.residence_form.get('residence_from_date')?.value);
            // this.residence_to_date = new Date(this.residence_form.get('residence_to_date')?.value);
            // this.residence_from_date.setHours(0, 0, 0, 0);
            // this.residence_to_date.setHours(0, 0, 0, 0);
            this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
            this.reservation_data.show_data.trip_id_for_show_hotels = this.trip_id_for_show_hotels;
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


    // 
    // else if (this.active_step == 3) {
    //   if (step > 3) {
    //     if (!this.checked_date && this.trip_type_selected_id != '4' && this.trip_type_selected_id != '5') {
    //       Swal.fire('خطأ', 'برجاء التأكد من تاريخ الحجز', 'error');
    //       return;
    //     }
    //     let residence_data_checked: boolean = false;
    //     let trip_data_checked: boolean = false;

    //     // this.going_selected_seats = [];
    //     // this.return_selected_seats = [];
    //     // في حالة اختيار سكن
    //     if (this.residence_type_selected_id == 1) {
    //       // وعدم اختيار رحلة
    //       if ((this.trip_type_selected_id == '' || this.trip_type_selected_id == '4') && this.residence_from_date && this.residence_to_date && this.hotel_selected_id && this.stay_type_selected_id) {
    //         this.reservation_data.residenceDto.fromDate = this.residence_from_date;
    //         this.reservation_data.residenceDto.toDate = this.residence_to_date;
    //         this.reservation_data.residenceDto.stayType = Number(this.stay_type_selected_id);
    //         this.reservation_data.residenceDto.hotelId = this.hotel_selected_id;
    //         // تخزين بيانات في اوبجيكت العرض
    //         this.show_reservation_details.from_date = this.residence_from_date;
    //         this.show_reservation_details.to_date = this.residence_to_date;
    //         this.show_reservation_details.stay_type = Number(this.stay_type_selected_id);
    //         this.show_reservation_details.hotel_id = this.hotel_selected_id;

    //         this.reservation_data.ticketDto = null;
    //         residence_data_checked = true;
    //       }

    //       // اختيار رحلة مغلقة
    //       else if (this.trip_type_selected_id == '5' && this.hotel_selected_id && this.stay_type_selected_id && this.closed_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length && this.return_selected_seats.length == this.confirmed_users.length) {
    //         this.reservation_data.residenceDto.fromDate = this.closed_trip_selected.departureTime;
    //         this.reservation_data.residenceDto.toDate = this.closed_trip_selected.returnTime;
    //         this.reservation_data.residenceDto.stayType = Number(this.stay_type_selected_id);
    //         this.reservation_data.residenceDto.hotelId = this.hotel_selected_id;
    //         // تخزين بيانات في اوبجيكت العرض
    //         this.show_reservation_details.from_date = this.closed_trip_selected.departureTime;
    //         this.show_reservation_details.to_date = this.closed_trip_selected.returnTime;
    //         this.show_reservation_details.stay_type = Number(this.stay_type_selected_id);
    //         this.show_reservation_details.hotel_id = this.hotel_selected_id;

    //         residence_data_checked = true;
    //         console.log(this.show_reservation_details, 1111);

    //       }
    //       // اختيار رحلة ذهاب فقط
    //       else if (this.trip_type_selected_id == '1' && this.go_date && this.residence_to_date && this.hotel_selected_id && this.stay_type_selected_id && this.open_going_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length) {
    //         this.reservation_data.residenceDto.fromDate = this.go_date;
    //         this.reservation_data.residenceDto.toDate = this.residence_to_date;
    //         this.reservation_data.residenceDto.stayType = Number(this.stay_type_selected_id);
    //         this.reservation_data.residenceDto.hotelId = this.hotel_selected_id;
    //         // تخزين بيانات في اوبجيكت العرض
    //         this.show_reservation_details.from_date = this.go_date;
    //         this.show_reservation_details.to_date = this.residence_to_date;
    //         this.show_reservation_details.stay_type = Number(this.stay_type_selected_id);
    //         this.show_reservation_details.hotel_id = this.hotel_selected_id;

    //         console.log(this.show_reservation_details, 2222, this.residence_to_date);

    //         residence_data_checked = true;
    //       }
    //       // اختيار رحلة عودة فقط
    //       else if (this.trip_type_selected_id == '2' && this.return_date && this.residence_from_date && this.hotel_selected_id && this.stay_type_selected_id && this.open_return_trip_selected.id && this.return_selected_seats.length == this.confirmed_users.length) {
    //         this.reservation_data.residenceDto.fromDate = this.residence_from_date;
    //         this.reservation_data.residenceDto.toDate = this.return_date;
    //         this.reservation_data.residenceDto.stayType = Number(this.stay_type_selected_id);
    //         this.reservation_data.residenceDto.hotelId = this.hotel_selected_id;
    //         // تخزين بيانات في اوبجيكت العرض
    //         this.show_reservation_details.from_date = this.residence_from_date;
    //         this.show_reservation_details.to_date = this.return_date;
    //         this.show_reservation_details.stay_type = Number(this.stay_type_selected_id);
    //         this.show_reservation_details.hotel_id = this.hotel_selected_id;

    //         residence_data_checked = true;
    //       }
    //       // اختيار رحلة ذهاب وعودة
    //       else if (this.trip_type_selected_id == '3' && this.go_date && this.return_date && this.hotel_selected_id && this.stay_type_selected_id && this.open_going_trip_selected && this.open_return_trip_selected) {
    //         this.reservation_data.residenceDto.fromDate = this.go_date;
    //         this.reservation_data.residenceDto.toDate = this.return_date;
    //         this.reservation_data.residenceDto.stayType = Number(this.stay_type_selected_id);
    //         this.reservation_data.residenceDto.hotelId = this.hotel_selected_id;
    //         // تخزين بيانات في اوبجيكت العرض
    //         this.show_reservation_details.from_date = this.go_date;
    //         this.show_reservation_details.to_date = this.return_date;
    //         this.show_reservation_details.stay_type = this.stay_type_selected_id;
    //         this.show_reservation_details.hotel_id = this.hotel_selected_id;

    //         residence_data_checked = true;
    //       }
    //       else if (this.trip_type_selected_id == '4') {

    //       }
    //       else {
    //         Swal.fire('خطأ', 'برجاء اختيار فندق وإكمال باقي البيانات المطلوبة', 'error');
    //       }
    //     }
    //     else {
    //       residence_data_checked = true;
    //       this.reservation_data.residenceDto = null;
    //     }

    //     // في حالة اختيار رحلة
    //     if (this.trip_type_selected_id !== '' && this.trip_type_selected_id !== '4') {
    //       // في حالة اختيار رحلة مغلقة
    //       if (this.trip_type_selected_id == '5' && this.closed_trip_selected.id &&
    //         this.going_selected_seats.length == this.confirmed_users.length &&
    //         this.return_selected_seats.length == this.confirmed_users.length) {

    //         this.reservation_data.busChairPrice = this.closed_trip_selected.chairPrice;
    //         this.reservation_data.returnBusChairPrice = this.closed_trip_selected.chairPrice;

    //         this.reservation_data.ticketDto = {
    //           "tripTicketType": Number(this.trip_type_selected_id),
    //           "customersIds": this.confirmed_users,
    //           "tripTickets": [
    //             {
    //               "tripId": this.closed_trip_selected.id,
    //               "departureReservedChairs": this.going_selected_seats.toString(),
    //               "returnReservedChairs": this.return_selected_seats.toString()
    //             }
    //           ]
    //         }

    //         this.show_reservation_details.closed_trip_selected = this.closed_trip_selected;
    //         // تخزين تاريخ الرحلة للعرض
    //         this.show_reservation_details.from_date = this.closed_trip_selected.departureTime;
    //         this.show_reservation_details.to_date = this.closed_trip_selected.returnTime;
    //         // 
    //         this.show_reservation_details.open_going_trip_selected = {};
    //         this.show_reservation_details.open_return_trip_selected = {};
    //         trip_data_checked = true;
    //       }
    //       // في حالة اختيار رحلة ذهاب
    //       else if (this.trip_type_selected_id == '1' && this.open_going_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length) {

    //         this.reservation_data.busChairPrice = this.open_going_trip_selected.chairPrice;
    //         this.reservation_data.returnBusChairPrice = 0;

    //         this.reservation_data.ticketDto = {
    //           "tripTicketType": Number(this.trip_type_selected_id),
    //           "customersIds": this.confirmed_users,
    //           "tripTickets": [
    //             {
    //               "tripId": this.open_going_trip_selected.id,
    //               "departureReservedChairs": this.going_selected_seats.toString(),
    //               "returnReservedChairs": ''
    //             }
    //           ]
    //         }
    //         this.show_reservation_details.open_going_trip_selected = this.open_going_trip_selected;
    //         // تخزين تاريخ الرحلة للعرض
    //         this.show_reservation_details.from_date = this.go_date;
    //         //this.show_reservation_details.to_date = '';
    //         //
    //         this.show_reservation_details.open_return_trip_selected = {};
    //         trip_data_checked = true;
    //       }
    //       // في حالة اختيار رحلة عودة
    //       else if (this.trip_type_selected_id == '2' && this.open_return_trip_selected.id && this.return_selected_seats.length == this.confirmed_users.length) {

    //         this.reservation_data.busChairPrice = 0;
    //         this.reservation_data.returnBusChairPrice = this.open_return_trip_selected.chairPrice;

    //         this.reservation_data.ticketDto = {
    //           "tripTicketType": Number(this.trip_type_selected_id),
    //           "customersIds": this.confirmed_users,
    //           "tripTickets": [
    //             {
    //               "tripId": this.open_return_trip_selected.id,
    //               "departureReservedChairs": '',
    //               "returnReservedChairs": this.return_selected_seats.toString()
    //             }
    //           ]
    //         }
    //         this.show_reservation_details.open_going_trip_selected = {};
    //         // تخزين تاريخ الرحلة للعرض
    //         //this.show_reservation_details.from_date = '';
    //         this.show_reservation_details.to_date = this.return_date;
    //         // 
    //         this.show_reservation_details.open_return_trip_selected = this.open_return_trip_selected;
    //         trip_data_checked = true;
    //       }
    //       // في حالة اختيار رحلة ذهاب و عودة
    //       else if (this.trip_type_selected_id == '3' && this.open_going_trip_selected.id && 
    //         this.open_return_trip_selected.id
    //         this.open_return_trip_selected.id &&
    //         this.going_selected_seats.length == this.confirmed_users.length &&
    //         this.return_selected_seats.length == this.confirmed_users.length) {

    //         this.reservation_data.busChairPrice = this.open_going_trip_selected.chairPrice;
    //         this.reservation_data.returnBusChairPrice = this.open_return_trip_selected.chairPrice;

    //         this.reservation_data.ticketDto = {
    //           "tripTicketType": Number(this.trip_type_selected_id),
    //           "customersIds": this.confirmed_users,
    //           "tripTickets": [
    //             {
    //               "tripId": this.open_going_trip_selected.id,
    //               "departureReservedChairs": this.going_selected_seats.toString(),
    //               "returnReservedChairs": ''
    //             },
    //             {
    //               "tripId": this.open_return_trip_selected.id,
    //               "departureReservedChairs": '',
    //               "returnReservedChairs": this.return_selected_seats.toString()
    //             }
    //           ]
    //         }
    //         this.show_reservation_details.open_going_trip_selected = this.open_going_trip_selected;
    //         this.show_reservation_details.open_return_trip_selected = this.open_return_trip_selected;
    //         this.show_reservation_details.from_date = this.go_date;
    //         this.show_reservation_details.to_date = this.return_date;
    //         trip_data_checked = true;
    //       }
    //       else {
    //         Swal.fire('خطأ', 'يجب ان تدخل جميع البيانات المطلوبة', 'error')
    //       }
    //     }

    //     if (residence_data_checked && trip_data_checked || residence_data_checked && !trip_data_checked) {
    //       this.active_step = step;
    //       this.completed_steps[2] = true;
    //       console.log(this.reservation_data, 'reservation_data');

    //     }

    //   }
    //   else {
    //     this.active_step = step;
    //     this.completed_steps[2] = false;
    //   }
    // }

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
    this.reservation_data.busChairPrice = this.open_going_trip_selected.chairPrice;
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
    // this.residence_form.get('residence_to_date')?.setValue(this.open_return_trip_selected.returnTime);
    this.reservation_data.residenceDto = null;
    this.reservation_data.busChairPrice = 0;
    this.reservation_data.returnBusChairPrice = this.open_return_trip_selected.chairPrice;
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
    this.reservation_data.busChairPrice = this.open_going_trip_selected.chairPrice;
    this.reservation_data.returnBusChairPrice = this.open_return_trip_selected.chairPrice;

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
    //this.reservation_data.show_data.residence_from_date_to_show = going_date.toISOString();
    // 
    const return_date = new Date(this.open_return_trip_selected.returnTime);
    return_date.setUTCDate(return_date.getUTCDate());
    // return_date.setUTCDate(return_date.getUTCDate() - 1);
    this.residence_form.get('residence_to_date')?.setValue(return_date);
    // this.reservation_data.show_data.residence_to_date_to_show = return_date.toISOString();

    // store trip_id in shared var to call hotels once in trip 3
    this.trip_id_for_show_hotels = this.open_going_trip_selected.id;
  }
  // set trip data in trip_id 5
  set_closed_trip_data() {
    console.log(this.closed_trip_selected, 'mohamed');

    this.reservation_data.busChairPrice = this.closed_trip_selected.chairPrice;
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
    // this.reservation_data.show_data.residence_from_date_to_show = going_date.toISOString();
    // 
    const return_date = new Date(this.closed_trip_selected.returnTime);
    return_date.setUTCDate(return_date.getUTCDate());
    // return_date.setUTCDate(return_date.getUTCDate() - 1);
    // this.reservation_data.show_data.residence_to_date_to_show = return_date.toISOString();
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
  // عند اختيار رحلة ذهاب وعودة
  going_return_trip_selected(trip: Itrip) {
    this.closed_trip_selected = trip
    this.residence_type_selected_id = null;
    this.residence_form.reset();
    this.reserved_data_in_trip_per_hotel = {};
  }
  // عند اختيار رحلة ذهاب فقط
  going_trip_selected(trip: Itrip) {
    this.open_going_trip_selected = trip;
    this.going_selected_seats = [];
    this.residence_type_selected_id = null;
    this.residence_form.reset();
    this.reserved_data_in_trip_per_hotel = {};
  }
  // عند اختيار رحلة عودة فقط
  return_trip_selected(trip: Itrip) {
    this.open_return_trip_selected = trip;
    this.return_selected_seats = [];
    this.residence_type_selected_id = null;
    this.residence_form.reset();
    this.reserved_data_in_trip_per_hotel = {};
  }

  get_remaining_cost(paid_cost: number) {
    this.reservation_data.moneyPaid = paid_cost;
  }
  get_notes(notes: string) {
    this.reservation_data.notes = notes;
  }
  show_data: any = {};
  // confirm_reservation() {
  //   if (!this.reservation_data.paymentMethod) {
  //     Swal.fire('خطأ', 'برجاء اختيار طريقة الدفع', 'error')
  //     return
  //   }
  //   if (!this.reservation_data.moneyPaid) {
  //      Swal.fire({
  //           title: 'تنبيه',
  //           text: "لم يتم اي مبلغ من الإجمالي هل تود المتابعة",
  //           icon: 'warning',
  //           showCancelButton: true,
  //           confirmButtonColor: '#B50D0D',
  //           cancelButtonColor: '#b0b0b0',
  //           confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
  //           cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
  //         }).then((result) => {
  //           if (!result.isConfirmed) {
  //             return
  //           }
  //         });
  //   }
  //   this.show_data = this.reservation_data.show_data;
  //   delete this.reservation_data.show_data;
  //   this.reservationsService.create_reservation(this.reservation_data).subscribe({
  //     next: (res: any) => {
  //       console.log(res);
  //       if (res.ok) {
  //         Swal.fire('نجاح', 'تم اضافة الحجز بنجاح', 'success')
  //       }
  //       else {
  //         Swal.fire('خطأ', 'حدث خطأ اثناء اضافة الحجز', 'error')
  //         this.reservation_data.show_data = this.show_data
  //       }
  //       this.router.navigate(['reservations']);
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       Swal.fire('خطأ', 'حدث خطأ اثناء اضافة الحجز', 'error')
  //       this.reservation_data.show_data = this.show_data
  //     }
  //   })
  // }
  async confirm_reservation() {
    if (!this.reservation_data.paymentMethod) {
      Swal.fire('خطأ', 'برجاء اختيار طريقة الدفع', 'error');
      return;
    }

    if (this.reservation_data.moneyPaid == 0) {
      // const result = await Swal.fire({
      //   title: 'تنبيه',
      //   text: "يجب دفع مبلغ من الإجمالي بحد ادني 1 ر.س",
      //   icon: 'warning',
      //   // showCancelButton: true,
      //   confirmButtonColor: '#B50D0D',
      //   // cancelButtonColor: '#b0b0b0',
      //   confirmButtonText: 'نعم ',
      //   // cancelButtonText: 'لا'
      // });
      // return;
      // // if (!result.isConfirmed) {
      // //   return; // المستخدم ضغط على "إلغاء"
      // // }
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

    this.show_data = this.reservation_data.show_data;
    delete this.reservation_data.show_data;

    const employeeId = localStorage.getItem('userId');
    if (employeeId) {
      this.reservation_data.employeeId = employeeId;
    }

    this.reservationsService.create_reservation(this.reservation_data).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.ok) {
          Swal.fire('نجاح', 'تم اضافة الحجز بنجاح', 'success');
          this.router.navigate(['show-Reservation', res.data.id]);
        } else {
          Swal.fire('خطأ', res.message || 'حدث خطأ اثناء اضافة الحجز', 'error');
          this.reservation_data.show_data = this.show_data;
        }
        // this.router.navigate(['reservations']);
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire('خطأ', err.error.message || 'حدث خطأ اثناء اضافة الحجز', 'error');
        this.reservation_data.show_data = this.show_data;
      }
    });
  }


  //checked_date: boolean = false;
  // check_going_date(go_date_input: HTMLInputElement) {
  //   const today_date = new Date();
  //   const go_date = new Date(go_date_input.value);
  //   const trip_return_date = this.return_date ? new Date(this.return_date) : null;
  //   const recedince_return_date = this.residence_form.get('residence_to_date')?.value ? new Date(this.residence_form.get('residence_to_date')?.value) : null;

  //   today_date.setHours(0, 0, 0, 0);
  //   go_date.setHours(0, 0, 0, 0);
  //   trip_return_date?.setHours(0, 0, 0, 0);
  //   recedince_return_date?.setHours(0, 0, 0, 0);

  //   const is_go_date_after_tody = go_date > today_date;
  //   const is_with_residence = this.residence_type_selected_id == 1;

  //   // رحلة ذهاب مع سكن
  //   if (this.trip_type_selected_id == '1' && is_with_residence) {
  //     if (recedince_return_date && go_date < recedince_return_date && is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب');
  //       return;
  //     }
  //     else if (!recedince_return_date && is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false
  //       console.log('nooooooooo');
  //     }
  //   }
  //   // رحلة عودة مع سكن
  //   else if (this.trip_type_selected_id == '2' && is_with_residence) {
  //     if (trip_return_date && go_date < trip_return_date && is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     // تاريخ ذهاب الي الفندق فارغ
  //     else if (!trip_return_date && is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false
  //       console.log('nooooooooo');
  //     }
  //   }
  //   // رحلة ذهاب وعودة
  //   else if (this.trip_type_selected_id == '3') {
  //     if (trip_return_date && go_date < trip_return_date && is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب وعودة');
  //       return;
  //     }
  //     else if (!trip_return_date && is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب وعودة');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false
  //       console.log('nooooooooo');
  //     }
  //   }
  //   // رحلة ذهاب بدون سكن
  //   else if (this.trip_type_selected_id == '1' && !is_with_residence) {
  //     if (is_go_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false
  //       console.log('nooooooooo');
  //     }
  //   }
  //   else {
  //     this.checked_date = false
  //     console.log('nooooooooo');
  //   }
  // }
  // check_return_date(return_date_input: HTMLInputElement) {
  //   const today_date = new Date();
  //   const return_date = new Date(return_date_input.value);
  //   const trip_go_date = this.go_date ? new Date(this.go_date) : null;
  //   const recedince_go_date = this.residence_form.get('residence_from_date')?.value ? new Date(this.residence_form.get('residence_from_date')?.value) : null;

  //   today_date.setHours(0, 0, 0, 0);
  //   return_date.setHours(0, 0, 0, 0);
  //   trip_go_date?.setHours(0, 0, 0, 0);
  //   recedince_go_date?.setHours(0, 0, 0, 0);

  //   const is_return_date_after_tody = return_date > today_date;
  //   const is_with_residence = this.residence_type_selected_id == 1;

  //   // رحلة عودة مع سكن
  //   if (this.trip_type_selected_id == '2' && is_with_residence) {
  //     if (recedince_go_date && return_date > recedince_go_date && is_return_date_after_tody) {
  //       this.checked_date = true;
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     else if (!recedince_go_date && is_return_date_after_tody) {
  //       this.checked_date = true;
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false;
  //       console.log('nooooooooo');

  //     }
  //   }
  //   // رحلة ذهاب مع سكن
  //   if (this.trip_type_selected_id == '1' && is_with_residence) {
  //     if (trip_go_date && return_date > trip_go_date && is_return_date_after_tody) {
  //       this.checked_date = true;
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     else if (!trip_go_date && is_return_date_after_tody) {
  //       this.checked_date = true;
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     else {
  //       console.log('nooooooooo');
  //       this.checked_date = false;
  //     }
  //   }
  //   // رحلة ذهاب وعودة
  //   else if (this.trip_type_selected_id == '3') {
  //     if (trip_go_date && return_date > trip_go_date && is_return_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب وعودة');
  //       return;
  //     }
  //     else if (!trip_go_date && is_return_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة ذهاب وعودة');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false
  //       console.log('nooooooooo');
  //     }
  //   }
  //   // رحلة عودة بدون سكن
  //   else if (this.trip_type_selected_id == '2' && !is_with_residence) {
  //     if (is_return_date_after_tody) {
  //       this.checked_date = true
  //       console.log('yesssssssssss رحلة عودة');
  //       return;
  //     }
  //     else {
  //       this.checked_date = false
  //       console.log('nooooooooo');
  //     }
  //   }
  //   else {
  //     this.checked_date = false
  //     console.log('nooooooooo');
  //   }

  // }

  reset_step_3() {
    this.min_return_date = '';
    this.reserved_data_in_trip_per_hotel = {};
    this.residence_type_selected_id = null;
    //this.stay_type_selected_id = '';
    //this.hotel_selected_id = '';
    //this.residence_from_date = '';
    //this.residence_to_date = '';
    this.residence_form.reset();
    this.reservation_data.residenceDto = null
    this.reservation_data.ticketDto = null
    this.go_date = '';
    this.return_date = '';
    //this.checked_date = false
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