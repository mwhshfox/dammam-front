import { Component, Input, OnInit, Output, Type, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientsService } from '../../../core/services/clients.service';
import { Router, RouterLink } from '@angular/router';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { iUser } from '../../../core/models/admins.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, EnumPipe],
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.scss'
})
export class AddClientComponent {
  constructor(private fb: FormBuilder, private clientsService: ClientsService) { }
  private readonly router = inject(Router);
  @Input() current_user: iUser = {} as iUser

  clientForm!: FormGroup;
  adding_done: boolean = false
  current_client: iUser = {} as iUser
  countries: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,19,20,21,22,23,24,25,26,27,28,29]

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nationalityId: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      nationality: [null, Validators.required],
      gender: [null, Validators.required],
      role: ['user']
    });

    this.clientsService.current_stage.next('add-new')
  }

  submit_form() {
    const clientData = this.clientForm.value;
    if (this.clientForm.valid) {
      console.log('client Data:', clientData);
      this.send_new_client(clientData)
    }
    else {
      this.clientForm.markAllAsTouched();
      console.log('form is not valid', this.clientForm);
    }


    // هنا تبعت البيانات للسيرفس أو الـ API

    // Reset or close modal لو حبيت
  }

  send_new_client(body: {}) {
    this.clientsService.add_new_client([body]).subscribe({
      next: (res: any) => {
        if (res.data[0].success) {
          this.show_succes_alert()
          console.log("done", res);
          this.clientForm.reset();
          this.clientForm.get("role")?.setValue('user') // make it default role 
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
        const messagesArray: string[] = err.error.errors;
        const formattedMessage = messagesArray.join('<br>');
        Swal.fire(
          "خطأ", formattedMessage, "error"
        )
      }
    })
  }


  show_succes_alert() {
    Swal.fire({
      title: `تم الاضافة بنجاح`,
      text: `  تم اضافة عميل جديد بنجاح`,
      icon: 'success',
      // showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      // cancelButtonColor: '#3085d6',
      confirmButtonText: 'موافق',
      // cancelButtonText: 'اضافة جديد + ' 
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['clients'])
      }
    });
  }

  onTrimSpacesInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const trimmedValue = input.value.trim(); // يشيل المسافات من البداية والنهاية
    input.value = trimmedValue;
    this.clientForm.get(controlName)?.setValue(trimmedValue);
  }









}


