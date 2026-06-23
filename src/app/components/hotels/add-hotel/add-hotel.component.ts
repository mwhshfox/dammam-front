import { Component, Input, OnInit, Output, Type, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { iUser } from '../../../core/models/admins.models';
import Swal from 'sweetalert2';
import { HotelsService } from '../../../core/services/hotels.service';
@Component({
  selector: 'app-add-hotel',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, EnumPipe],
  templateUrl: './add-hotel.component.html',
  styleUrl: './add-hotel.component.scss'
})
export class AddHotelComponent {
  constructor(private fb: FormBuilder, private Hotel_Service: HotelsService) { }
  private readonly router = inject(Router);
  @Input() current_user: iUser = {} as iUser

  hotel_form!: FormGroup;
  adding_done: boolean = false
  current_hotel: iUser = {} as iUser
  all_city: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

  ngOnInit(): void {
    this.hotel_form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(25)]],
      place: [null, [Validators.required]], // المحافظة---------
      address: ['', [Validators.required, Validators.maxLength(30)]],
      bedPrice: ['', [Validators.required, Validators.pattern(/^[0-9]{1,3}$/)]],
      roomPrice: ['', [Validators.required, Validators.pattern(/^[0-9]{1,4}$/)]],
    });

    this.Hotel_Service.current_stage.next('add-new')
  }

  submit_form() {
    const hotel_data = this.hotel_form.value;
    if (this.hotel_form.valid) {
      console.log('hotel data:', hotel_data);
      this.send_new_hotel(hotel_data)
    }
    else {
      this.hotel_form.markAllAsTouched();
      console.log('form is not valid', this.hotel_form);
    }
  }

  send_new_hotel(body: {}) {
    this.Hotel_Service.add_new_hotel(body).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.show_succes_alert()
          console.log("done", res);
          this.hotel_form.reset();
        }
        else {
          console.log("err", res.data[0].message);
          console.log("err", res);
          Swal.fire(
            "خطأ", res.data[0].message, "error"
          )
        }
      },
      error: (err) => {
        console.log(err);
        console.log(err.error.errors);
        Swal.fire(
          "خطأ", err.error.errors, "error"
        )

      }
    })
  }

  onPriceInputBed(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^0-9]/g, '');  // إزالة أي شيء غير أرقام
    value = value.replace(/^0+/, '');  // منع الصفر في البداية (يعني مفيش 050 مثلاً)
    input.value = value;
    const numericValue = value ? Number(value) : null;  // تحويل القيمة إلى رقم أو null لو فاضي
    this.hotel_form.get('bedPrice')?.setValue(numericValue);
  }

  onPriceInputRoom(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^0-9]/g, '');  // إزالة أي شيء غير أرقام
    value = value.replace(/^0+/, '');  // منع الصفر في البداية (يعني مفيش 050 مثلاً)
    input.value = value;
    const numericValue = value ? Number(value) : null;  // تحويل القيمة إلى رقم أو null لو فاضي
    this.hotel_form.get('roomPrice')?.setValue(numericValue);
  }


  show_succes_alert() {
    Swal.fire({
      title: `تم الاضافة بنجاح`,
      text: `  تم اضافة فندق جديد بنجاح`,
      icon: 'success',
      // showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      // cancelButtonColor: '#3085d6',
      confirmButtonText: 'موافق',
      // cancelButtonText: 'اضافة جديد + ' 
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['hotels'])
      }
    });
  }



  onTrimSpacesInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const trimmedValue = input.value.trim(); // يشيل المسافات من البداية والنهاية
    input.value = trimmedValue;
    this.hotel_form.get(controlName)?.setValue(trimmedValue);
  }

}
