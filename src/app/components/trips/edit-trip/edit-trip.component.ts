import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Itrip } from '../../../core/models/itrip';
import { TripsService } from '../../../core/services/trips.service';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from "../../../shared/components/date-picker/date-picker.component";

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [ReactiveFormsModule, EnumPipe, DatePipe, CommonModule, DatePickerComponent],
  templateUrl: './edit-trip.component.html',
  styleUrl: './edit-trip.component.scss'
})
export class EditTripComponent {
  constructor(private fb: FormBuilder, private trip_Service: TripsService) { }
  private readonly router = inject(Router);


  tirp_form!: FormGroup;
  current_trip: Itrip = {} as Itrip
  all_city: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  today = new Date();
  formattedToday = this.today.toISOString().split('T')[0]; // yyyy-mm-dd
  minDepartureDate!: string;
  minReturnDate!: string;

  ngOnInit(): void {
    this.tirp_form = this.fb.group({
      id: ['', [Validators.required]],
      driverName1: ['', [Validators.required, Validators.maxLength(25)]],
      driverName2: ['', [Validators.required, Validators.maxLength(25)]],
      driverPhoneNumber1: ['', [Validators.required]], // Validators.pattern(/^[0-9]{10}$/)]
      driverPhoneNumber2: ['', [Validators.required]],
      driverNationalId1: ['', [Validators.required]],
      driverNationalId2: ['', [Validators.required]],
      plateNumber: [''],
      plateLetters: ['', [this.plateLettersValidator()]],
      plateDigits: ['', [Validators.maxLength(5), Validators.pattern(/^[0-9]*$/)]],
      // departureTime: ['', [Validators.required]],
      // returnTime: ['', [Validators.required]],
      // fromCity: [null, [Validators.required]],
      // toCity: [null, [Validators.required]],
      // busType: [null, [Validators.required]],
      // tripCode: ['', [Validators.required, Validators.maxLength(20)]],
      // chairPrice: [null, [Validators.required, Validators.pattern(/^[0-9]{1,3}$/)]],
      // departureReservedChairs: [''],
      // returnReservedChairs: [''],
    });

    this.trip_Service.current_stage.next('edit')

    this.get_current_trip();
    this.initPlateNumberSync();
    // this.min_max_date_validation()



  }


  get_current_trip() {
    this.trip_Service.current_trip.subscribe(value => {
      this.current_trip = value as Itrip
      if (this.current_trip.id) {
        console.log('Current trip:', this.current_trip);
        this.tirp_form.patchValue(this.current_trip as any)
        this.populatePlateControls(this.current_trip.plateNumber);
        
        // this.set_current_date_to_inputs()
      }
      else {
        this.router.navigate(['trips/all-trips'])
      }
    }).unsubscribe()

  }


  // min_max_date_validation() {
  //   this.minDepartureDate = this.formattedToday;
  //   let subscribtion1 = this.tirp_form.get('departureTime')?.valueChanges.subscribe((value: string) => {
  //     if (value) {
  //       this.tirp_form.get('returnTime')?.reset();
  //       const date = new Date(value);
  //       date.setDate(date.getDate() + 1); // اليوم اللي بعده
  //       this.minReturnDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  //     }
  //   })
  // }


  submit_form() {
    const trip_driver_data = { ...this.tirp_form.value } as any;
    delete trip_driver_data['plateLetters'];
    delete trip_driver_data['plateDigits'];
    console.log(trip_driver_data);

    if (this.tirp_form.valid) {
      console.log('trip driver data:', trip_driver_data);
      this.send_new_trip(trip_driver_data)
    }
    else {
      this.tirp_form.markAllAsTouched();
      console.log('form is not valid', this.tirp_form);
    }
  }


  send_new_trip(body: Itrip) {
    console.log(body);
    this.trip_Service.edit_trip(body).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.show_succes_alert()
          console.log("done", res);
          this.tirp_form.reset();
        }
        else {
          console.log("err", res.message);
          console.log("err", res);
          Swal.fire(
            "خطأ", res.message, "error"
          )
        }
      },
      error: (err) => {
        console.log(err);
        Swal.fire(
          "خطأ", err.errors[0], "error"
        )
      }
    })

  }


  // onPriceInput(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   let value = input.value;
  //   value = value.replace(/[^0-9]/g, '');  // إزالة أي شيء غير أرقام
  //   value = value.replace(/^0+/, '');  // منع الصفر في البداية (يعني مفيش 050 مثلاً)
  //   input.value = value;
  //   const numericValue = value ? Number(value) : null;  // تحويل القيمة إلى رقم أو null لو فاضي
  //   this.tirp_form.get('chairPrice')?.setValue(numericValue);
  // }


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
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 5);
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

  private populatePlateControls(fullPlate?: string): void {
    if (!this.tirp_form) {
      return;
    }

    const normalized = fullPlate || '';
    const [lettersPartRaw = '', digitsPartRaw = ''] = normalized.split('-').map(part => part?.trim() ?? '');

    const lettersCompact = lettersPartRaw.replace(/\s+/g, '').slice(0, 5);
    const lettersSpaced = lettersCompact.split('').join(' ');
    const digits = digitsPartRaw.replace(/\D/g, '').slice(0, 5);

    this.tirp_form.get('plateLetters')?.setValue(lettersSpaced, { emitEvent: false });
    this.tirp_form.get('plateDigits')?.setValue(digits, { emitEvent: false });
    this.composePlateNumber();
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

  show_succes_alert() {
    Swal.fire({
      title: `تم التعديل `,
      text: `  تم تعديل بيانات الرحلة بنجاح`,
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


  // set_current_date_to_inputs() {
  //   let formatted_start_date = this.formatDateForInput(this.current_trip.departureTime);
  //   this.tirp_form.get('departureTime')?.setValue(formatted_start_date);

  //   let formatted_return_date = this.formatDateForInput(this.current_trip.returnTime);
  //   this.tirp_form.get('returnTime')?.setValue(formatted_return_date);

  //   let formatted_transit_date = this.formatDateForInput(this.current_trip.transitLeaveTime);
  //   this.tirp_form.get('transitLeaveTime')?.setValue(formatted_transit_date);

  //   const start_date = new Date(formatted_start_date);
  //   start_date.setDate(start_date.getDate() + 1); // اليوم اللي بعده
  //   this.minReturnDate = start_date.toISOString().split('T')[0]; // YYYY-MM-DD
  // }


  // get departureTime() {
  //   return this.tirp_form.get('departureTime')?.value;
  // }

  // get returnTime() {
  //   return this.tirp_form.get('returnTime')?.value;
  // }

  // get transitLeaveTime() {
  //   return this.tirp_form.get('transitLeaveTime')?.value;
  // }


  // formatDateForInput(dateInput: string | Date): string {
  //   const date = new Date(dateInput);
  //   const year = date.getFullYear();
  //   const month = ('0' + (date.getMonth() + 1)).slice(-2); // من 0 إلى 11
  //   const day = ('0' + date.getDate()).slice(-2);
  //   return `${year}-${month}-${day}`;
  // }


}




