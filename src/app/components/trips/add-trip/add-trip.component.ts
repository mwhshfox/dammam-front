import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TripsService } from '../../../core/services/trips.service';
import { Itrip } from '../../../core/models/itrip';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { DatePickerComponent } from "../../../shared/components/date-picker/date-picker.component";
import { HotelsService } from './../../../core/services/hotels.service';
import { Ihotel } from '../../../core/models/ihotel';
import lo from '@angular/common/locales/lo';
@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [ReactiveFormsModule, EnumPipe, NgClass, DatePickerComponent],

  templateUrl: './add-trip.component.html',
  styleUrl: './add-trip.component.scss'
})
export class AddTripComponent {
  constructor(private fb: FormBuilder, private trip_Service: TripsService, private Hotels_Service: HotelsService) { }
  private readonly router = inject(Router);

  tirp_form!: FormGroup;
  adding_done: boolean = false
  current_trip: Itrip = {} as Itrip
  all_city: number[] = [1, 2, 3]
  all_hotels: Ihotel[] = []
  today = new Date();
  formattedToday = this.today.toISOString().split('T')[0]; // yyyy-mm-dd
  minDepartureDate!: string;
  minReturnDate!: string;
  selectedOption: string = '';
  days_selected!: number
  bus_type: number = 0


  ngOnInit(): void {
    this.tirp_form = this.fb.group({
      driverName1: [''],
      driverNationalId1: [''],
      driverPhoneNumber1: [''],
      driverName2: [''],
      driverNationalId2: [''],
      driverPhoneNumber2: [''],
      plateNumber: [''], // رقم لوحة السيارة 
      plateLetters: ['', [this.plateLettersValidator()]],
      plateDigits: ['', [Validators.maxLength(5), Validators.pattern(/^[0-9]*$/)]],
      departureTime: ['', [Validators.required]],
      returnTime: ['', [Validators.required]],
      // transitLeaveTime: [null, [Validators.required]],

      fromCity: [null, [Validators.required]],
      toCity: [null, [Validators.required]],
      busType: [null, [Validators.required]],
      daysCount: [null, [Validators.required]],
      tripCode: ['', [Validators.required, Validators.maxLength(3)]],
      chairPrice: [null, [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]],

      hotels: this.fb.array([
        this.fb.group({
          hotelId: [null, [Validators.required]],
          bedPrice: [null, [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]],
          roomPrice: [null, [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]],
        })
      ]),
      // {
      //   "chairPrice": 50,
      //   "busType": 1,
      //   "driverName1": "احمد",
      //   "driverPhoneNumber1": "0107778657",
      //   "driverNationalId1": "1231234567",
      //   "driverName2": "جمال",
      //   "driverPhoneNumber2": "0107778658",
      //   "driverNationalId2": "1231234568",
      //   "departureTime": "2025-05-29T09:19:16.898Z",
      //   "returnTime": "2025-06-01T09:19:16.898Z",
      //   "transitLeaveTime": "2025-06-01T09:19:16.898Z",
      //   "fromCity": 1,
      //   "toCity": 2,
      //   "transitCity": 3,
      //   "tripCode": "901",
      //   "hotels": [
      //     {
      //       "hotelId": "a5420445-6f47-4f09-4ea2-08dd94c1a19a",
      //       "bedPrice": 250,
      //       "roomPrice": 900
      //     },
      //  {
      //       "hotelId": "a399d2f2-ffbc-4b3f-4ea1-08dd94c1a19a",
      //       "bedPrice": 350,
      //       "roomPrice": 1000
      //     }
      //   ]
      // }
    });
    this.min_max_date_validation()
    this.trip_Service.current_stage.next('add-new')
    this.get_days_count_for_trip()
    this.get_all_hotels()
    this.initPlateNumberSync();
  }

  get hotelsFormArray(): FormArray {
    return this.tirp_form.get('hotels') as FormArray;
  }

  min_max_date_validation() {
    let minDepartureDate_local: string;
    // هنا بنحسب تاريخ بكرة:
    const today = new Date(this.today);
    today.setDate(this.today.getDate());
    // this.minDepartureDate = today.toISOString().split('T')[0]; // yyyy-mm-dd
    this.minDepartureDate = today.toLocaleDateString('en-CA'); // yyyy-mm-dd

    // console.log('minDepartureDate', this.minDepartureDate);
    // console.log('minDepartureDate_local', minDepartureDate_local);

    this.tirp_form.get('departureTime')?.valueChanges.subscribe((value: string) => {
      if (value) {
        this.tirp_form.get('returnTime')?.reset();

        const date = new Date(value);
        date.setDate(date.getDate() + 1); // اليوم اللي بعده
        this.minReturnDate = date.toISOString().split('T')[0]; // yyyy-mm-dd
      }
    });
  }

  submit_form() {
    const trip_data = { ...this.tirp_form.value } as any;
    delete trip_data['plateLetters'];
    delete trip_data['plateDigits'];

    // تنسيق التواريخ إلى 'yyyy-MM-dd'
    trip_data.departureTime = this.formatDateOnly(trip_data.departureTime);
    trip_data.returnTime = this.formatDateOnly(trip_data.returnTime);
    if (this.selectedOption === 'both') {
      trip_data.transitLeaveTime = this.formatDateOnly(trip_data.transitLeaveTime);
    }


    if (this.tirp_form.valid) {
      console.log('form is valid', this.tirp_form.value);
      console.log('trip data:', trip_data);


      trip_data.driverName1 = trip_data.driverName1 ? trip_data.driverName1 : ".";
      trip_data.driverNationalId1 = trip_data.driverNationalId1 ? trip_data.driverNationalId1 : "0";
      trip_data.driverPhoneNumber1 = trip_data.driverPhoneNumber1 ? trip_data.driverPhoneNumber1 : "0";
      trip_data.driverName2 = trip_data.driverName2 ? trip_data.driverName2 : ".";
      trip_data.driverNationalId2 = trip_data.driverNationalId2 ? trip_data.driverNationalId2 : "0";
      trip_data.driverPhoneNumber2 = trip_data.driverPhoneNumber2 ? trip_data.driverPhoneNumber2 : "0";




      this.send_new_trip(trip_data);
    } else {
      this.tirp_form.markAllAsTouched();
      console.log('form is not valid', this.tirp_form.value);
      console.log('trip data:', trip_data);
    }
  }

  send_new_trip(body: {}) {
    this.trip_Service.add_new_trip(body).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.show_succes_alert()
          console.log("done", res);
          this.tirp_form.reset();
        }
        else {
          console.log('else eeeeeeeeeeeeeeeeeeeeeeeeeee');
          console.log("err", res.message);
          console.log("err", res);
          Swal.fire(
            "خطأ", res.message, "error"
          )
        }
      },
      error: (err) => {
        Swal.fire('خطأ', err.error.message, 'error')
        console.log(err.error.message);
      }
    })
  }


  formatDateOnly(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-CA'); // يُرجع التاريخ بالتنسيق 'yyyy-MM-dd'
  }

  get_days_count_for_trip() {
    this.tirp_form.get('departureTime')?.disable();
    this.tirp_form.get('returnTime')?.disable();
    this.tirp_form.get('transitLeaveTime')?.disable();
    this.tirp_form.get('daysCount')?.valueChanges.subscribe((value: number) => {
      if (!value) {
        console.log('no value');

        this.tirp_form.get('departureTime')?.disable();
        this.tirp_form.get('returnTime')?.disable();
        this.tirp_form.get('transitLeaveTime')?.disable();
      }
      else {
        console.log('has value');

        this.tirp_form.get('departureTime')?.enable();
        this.tirp_form.get('returnTime')?.enable();
        this.tirp_form.get('transitLeaveTime')?.enable();
      }
      this.days_selected = value;
      console.log('days_selected', this.days_selected);
      this.set_end_date_as_selected()
    });
  }



  set_end_date_as_selected() {
    const departureControl = this.tirp_form.get('departureTime');
    const returnControl = this.tirp_form.get('returnTime');
    const transitLeaveControl = this.tirp_form.get('transitLeaveTime');
    console.log('original departureControl', departureControl?.value);
    console.log('original returnControl', returnControl?.value);
    console.log('original transitLeaveControl', transitLeaveControl?.value);

    if (departureControl?.value) {
      const start_date = new Date(departureControl.value);
      start_date.setHours(0, 0, 0, 0);
      const daysCount = Number(this.days_selected - 1);

      // حساب تاريخ العودة
      const return_day = new Date(start_date);
      return_day.setDate(start_date.getDate() + daysCount);
      return_day.setHours(0, 0, 0, 0)
      const returnDateFormatted = return_day.toLocaleDateString('en-CA');
      returnControl?.setValue(returnDateFormatted);

      // حساب تاريخ مغادرة الترانزيت
      const transit_day = new Date(return_day);
      // transit_day.setDate(return_day.getDate() - 1);
      transit_day.setHours(0, 0, 0, 0); // تأكيد تصفير الوقت

      transit_day.setDate(return_day.getDate());
      const transitDateFormatted = transit_day.toLocaleDateString('en-CA');
      transitLeaveControl?.setValue(transitDateFormatted);

      // Debug Logs
      console.log('start_date:', start_date);
      console.log('return_day:', return_day);
      console.log('transit_day:', transit_day);
      console.log('returnDateFormatted:', returnDateFormatted);
      console.log('transitDateFormatted:', transitDateFormatted);
    }
  }





  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^0-9]/g, '');  // إزالة أي شيء غير أرقام
    value = value.replace(/^0+/, '');  // منع الصفر في البداية (يعني مفيش 050 مثلاً)
    input.value = value;
    const numericValue = value ? Number(value) : null;  // تحويل القيمة إلى رقم أو null لو فاضي
    this.tirp_form.get('chairPrice')?.setValue(numericValue);
  }


  onTrimSpacesInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const trimmedValue = input.value.trim(); // يشيل المسافات من البداية والنهاية
    input.value = trimmedValue;
    this.tirp_form.get(controlName)?.setValue(trimmedValue);
  }

  onPlateLettersInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value || '';
    const lettersOnly = rawValue.replace(/[^\u0621-\u064Aa-zA-Z]/g, '');
    const limited = lettersOnly.slice(0, 5);
    const spaced = limited.split('').join(' ');
    input.value = spaced;
    this.tirp_form.get('plateLetters')?.setValue(spaced);
  }

  onPlateDigitsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value || '';
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 4);
    input.value = digitsOnly;
    this.tirp_form.get('plateDigits')?.setValue(digitsOnly);
  }

  private initPlateNumberSync(): void {
    const lettersControl = this.tirp_form.get('plateLetters');
    const digitsControl = this.tirp_form.get('plateDigits');

    if (!lettersControl || !digitsControl) {
      return;
    }

    lettersControl.valueChanges.subscribe(() => this.composePlateNumber());
    digitsControl.valueChanges.subscribe(() => this.composePlateNumber());
  }

  private composePlateNumber(): void {
    const lettersRaw = (this.tirp_form.get('plateLetters')?.value || '').toString().trim();
    const digits = (this.tirp_form.get('plateDigits')?.value || '').toString().trim();
    const letters = lettersRaw ? lettersRaw.replace(/\s+/g, '').split('').join(' ') : '';
    const combined = letters && digits ? `${letters} - ${digits}` : letters || digits || '';
    this.tirp_form.get('plateNumber')?.setValue(combined, { emitEvent: false });
  }

  private plateLettersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').toString();
      const compact = value.replace(/\s+/g, '');

      if (!compact) {
        return null;
      }

      if (compact.length > 5) {
        return { maxlength: true };
      }

      if (!/^[\u0621-\u064Aa-zA-Z]+$/.test(compact)) {
        return { pattern: true };
      }

      return null;
    };
  }




  // onTrip_days_count(event: Event): void {
  //   console.log('event', event);
  //   const input = event.target as HTMLInputElement;
  //   let value = input.value;
  //   value = value.replace(/[^0-9]/g, '');  // إزالة أي شيء غير أرقام
  //   value = value.replace(/^0+/, '');  // منع الصفر في البداية (يعني مفيش 050 مثلاً)
  //   input.value = value;
  //   const numericValue = value ? Number(value) : null;  // تحويل القيمة إلى رقم أو null لو فاضي

  //   if (numericValue) {
  //     this.tirp_form.get('daysCount')?.setValue(numericValue);
  //     this.days_selected = numericValue;
  //     this.set_end_date_as_selected()
  //   }
  // }





  show_succes_alert() {
    Swal.fire({
      title: `تم الاضافة `,
      text: `  تم اضافة رحلة جديدة بنجاح`,
      icon: 'success',
      // showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      // cancelButtonColor: '#3085d6',
      confirmButtonText: 'موافق',
      // cancelButtonText: 'اضافة جديد + ' 
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['trips'])
      }
    });
  }



  // component.ts

  selectOption(value: string) {
    this.selectedOption = this.selectedOption === value ? '' : value;

    if (this.selectedOption === 'makkah') {
      this.tirp_form.reset()
      this.tirp_form.get('fromCity')?.setValue(1);
      this.tirp_form.get('toCity')?.setValue(2);
      this.tirp_form.removeControl('transitCity');
      this.tirp_form.removeControl('transitLeaveTime');
      // this.tirp_form.get('daysCount')?.reset();
      // this.tirp_form.get('departureTime')?.reset();
      // this.tirp_form.get('returnTime')?.reset();
    }
    else if (this.selectedOption === 'madinah') {
      this.tirp_form.reset()
      this.tirp_form.get('fromCity')?.setValue(1);
      this.tirp_form.get('toCity')?.setValue(3);
      this.tirp_form.removeControl('transitCity');
      this.tirp_form.removeControl('transitLeaveTime');
      // this.tirp_form.get('daysCount')?.reset();
      // this.tirp_form.get('departureTime')?.reset();
      // this.tirp_form.get('returnTime')?.reset();

    }
    else if (this.selectedOption === 'both') {
      this.tirp_form.reset()
      this.tirp_form.get('fromCity')?.setValue(1);
      this.tirp_form.get('toCity')?.setValue(3);
      this.tirp_form.addControl('transitCity', this.fb.control(2, Validators.required));
      this.tirp_form.addControl('transitLeaveTime', this.fb.control(null, Validators.required));
      this.tirp_form.get('transitLeaveTime')?.disable()
      // this.tirp_form.get('daysCount')?.reset();
      // this.tirp_form.get('departureTime')?.reset();
      // this.tirp_form.get('returnTime')?.reset();
      // this.tirp_form.get('transitLeaveTime')?.reset();

    }
    else {
      this.tirp_form.reset()
      this.tirp_form.removeControl('transitCity');
      this.tirp_form.removeControl('transitLeaveTime');
      this.tirp_form.get('fromCity')?.setValue(null);
      this.tirp_form.get('toCity')?.setValue(null);
      // this.tirp_form.reset()
    }

    console.log(this.tirp_form.value);
    this.tirp_form.get('tripCode')?.setValidators([
      Validators.required,
      Validators.maxLength(3),
      this.tripCodeValidator()
    ]);
    this.tirp_form.get('tripCode')?.updateValueAndValidity();

  }


  tripCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const num = Number(value);

      if (!value || isNaN(num)) return { invalidTripCode: true };

      if (this.selectedOption === 'makkah' && (this.bus_type <= 3 || this.bus_type == 8) && (num < 101 || num > 149)) {
        return { outOfRange: true };
      }
      if (this.selectedOption === 'makkah' && (this.bus_type >= 4 && this.bus_type != 8) && (num < 150 || num > 199)) {
        return { outOfRange: true };
      }


      if (this.selectedOption === 'madinah' && (this.bus_type <= 3 || this.bus_type == 8) && (num < 401 || num > 449)) {
        return { outOfRange: true };
      }

      if (this.selectedOption === 'madinah' && (this.bus_type >= 4 && this.bus_type != 8) && (num < 450 || num > 499)) {
        return { outOfRange: true };
      }

      if (this.selectedOption === 'both' && (this.bus_type <= 3 || this.bus_type == 8) && (num < 301 || num > 349)) {
        return { outOfRange: true };
      }

      if (this.selectedOption === 'both' && (this.bus_type >= 4 && this.bus_type != 8) && (num < 350 || num > 399)) {
        return { outOfRange: true };
      }

      return null; // valid
    };
  }


  set_trip_code(event: Event) {
    let type = this.tirp_form.get('busType')?.value || 0;
    this.tirp_form.get('tripCode')?.reset();
    console.log(type);
    this.bus_type = type;
  }

  get_all_hotels() {
    this.Hotels_Service.get_all_hotels().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_hotels = res.data;
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  addHotel() {
    if (this.hotelsFormArray.length < 3) {
      this.hotelsFormArray.push(this.fb.group({
        hotelId: [null, [Validators.required]],
        bedPrice: [null, [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]],
        roomPrice: [null, [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]],
      }))
    }
  }

  removeHotel() {
    if (this.hotelsFormArray.length > 1) {
      this.hotelsFormArray.removeAt(this.hotelsFormArray.length - 1);
    }
  }

}
