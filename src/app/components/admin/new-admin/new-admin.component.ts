import { Component, Input, OnInit, Output, Type, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminsService } from '../../../core/services/admins.service';
import { Router, RouterLink } from '@angular/router';
import { iUser } from '../../../core/models/admins.models';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-admin',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, EnumPipe],
  templateUrl: './new-admin.component.html',
  styleUrl: './new-admin.component.scss'
})
export class NewAdminComponent {
  constructor(private fb: FormBuilder, private adminsService: AdminsService) { }
  private readonly router = inject(Router);
  @Input() current_user: iUser = {} as iUser

  adminForm!: FormGroup;
  adding_done: boolean = false
  current_admin: iUser = {} as iUser
  countries: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,19,20,21,22,23,24,25,26,27,28,29]

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nationalityId: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      nationality: [null, Validators.required],
      gender: [null, Validators.required],
      qoyodId: [null, [ Validators.pattern(/^[0-9]{6,40}$/)]],
      // saleLimit: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      role: ['admin']
    });

    this.adminsService.current_stage.next('add-new')
  }

  submit_form() {
    const adminData = this.adminForm.value;
    if (this.adminForm.valid) {
      console.log('Admin Data:', adminData);
      this.send_new_admin(adminData)
    }
    else {
      this.adminForm.markAllAsTouched();
      console.log('form is not valid', this.adminForm);
    }


    // هنا تبعت البيانات للسيرفس أو الـ API

    // Reset or close modal لو حبيت
  }

  send_new_admin(body: {}) {
    this.adminsService.add_new_admin([body]).subscribe({
      next: (res: any) => {
        if (res.data[0].success) {
          console.log("truuue", res);
          this.adminForm.reset();
          this.adminForm.get("role")?.setValue('admin')
          this.show_succes_alert()
        }
        else {
          console.log("elseee", res.data[0].message);
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

  showForm() {
    this.adding_done = false
  }


  show_succes_alert() {
    Swal.fire({
      title: `تم الاضافة بنجاح`,
      text: `  تم اضافة مشرف جديد بنجاح`,
      icon: 'success',
      // showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      // cancelButtonColor: '#3085d6',
      confirmButtonText: 'موافق',
      // cancelButtonText: 'اضافة جديد + ' 
    }).then((result) => {
      this.router.navigate(['admin'])
    });
  }

  onTrimSpacesInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const trimmedValue = input.value.trim(); // يشيل المسافات من البداية والنهاية
    input.value = trimmedValue;
    this.adminForm.get(controlName)?.setValue(trimmedValue);
  }



}
