import { Component, Input, OnInit, Output, Type, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminsService } from '../../../core/services/admins.service';
import { Router, RouterLink } from '@angular/router';
import { iUser } from '../../../core/models/admins.models';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, EnumPipe ,NgClass],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  constructor(private fb: FormBuilder, private adminsService: AdminsService) { }
  private readonly router = inject(Router);
  @Input() current_user: iUser = {} as iUser


  countries: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,19,20,21,22,23,24,25,26,27,28,29]
  adminForm!: FormGroup;
  adding_done: boolean = false
  current_admin: iUser = {} as iUser
  is_admin: boolean = false

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      id: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nationalityId: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      nationality: [null, Validators.required],
      gender: [null, Validators.required],
      qoyodId: [null, [ Validators.pattern(/^[0-9]{1,30}$/)]],
      // saleLimit: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      role: ['admin']
    });
    this.adminsService.current_stage.next('edit')

    this.get_current_admin();
    this.get_permissions();
  }

  get_current_admin() {
    this.adminsService.current_admin.subscribe(value => {
      this.current_admin = value as iUser
      if (this.current_admin.id) {
        console.log('yoooogaaad');

      }
      else {
        console.log('rughhhhhhhhhhht');

        this.router.navigate(['admin/all-admins'])
      }
    }).unsubscribe()

    this.adminForm.patchValue(this.current_admin)
  }

  submit_form() {
    if (this.adminForm.valid) {
      console.log('adminForm-value:', this.adminForm.value);
      this.send_new_admin(this.adminForm.value)
    }
    else {
      this.adminForm.markAllAsTouched();
      console.log('form is not valid', this.adminForm);
    }

  }

  send_new_admin(body: {}) {
    this.adminsService.edit_admin(body).subscribe({
      next: (res: any) => {
        if (res.message == "نجاح ") {
          console.log(res);
          this.show_succes_alert()
          this.adminForm.reset();
          this.adminForm.get("role")?.setValue('admin')
        }
        else {
          console.log("elseee", res.message);
          Swal.fire(
            "خطأ", res.message, "error"
          )
        }
      },


      error: (err) => {
        console.log(err);
        Swal.fire(
          "خطأ", err.error.message, "error"
        )
      }
    })
  }

  showForm() {
    this.adding_done = false
  }





  show_succes_alert() {
    Swal.fire({
      title: `تم التعديل بنجاح`,
      text: `  تم تعديل بيانات المشرف بنجاح`,
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


  get_permissions() {
    let user_role = localStorage.getItem('user_role')
    console.log(user_role);
    if(user_role == 'Admin') {
      this.is_admin = true
    }
    else {
      this.is_admin = false
    }
  }
}
