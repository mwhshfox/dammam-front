import { Component, Input, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { iUser } from '../../../core/models/admins.models';
import { Router } from '@angular/router';
import { EmployeesService } from '../../../core/services/employees.service';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [ReactiveFormsModule, EnumPipe, NgClass],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss'
})
export class EditEmployeeComponent {
  constructor(private fb: FormBuilder, private emp_service: EmployeesService) { }
  private readonly router = inject(Router);
  @Input() current_user: iUser = {} as iUser

  clientForm!: FormGroup;
  current_client: iUser = {} as iUser
  countries: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,22,23,24,25,26,27,28,29]
  is_admin: boolean = false

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      id: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nationalityId: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      nationality: [null, Validators.required],
      gender: [null, Validators.required],
      qoyodId: [null, [Validators.pattern(/^[0-9]{1,40}$/)]],
      // saleLimit: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      role: ['Employee']
    });

    this.emp_service.current_stage.next('edit')

    this.get_current_client();
    this.get_permissions();
  }

  get_current_client() {
    this.emp_service.current_client.subscribe(value => {
      this.current_client = value as iUser
      if (this.current_client.id) {
        console.log('yoooogaaad', this.current_client.id);

      }
      else {
        console.log('rughhhhhhhhhhht');
        this.router.navigate(['employees/all-employees'])
      }
    }).unsubscribe()

    this.clientForm.patchValue(this.current_client)
  }

  submit_form() {
    if (this.clientForm.valid) {
      console.log('clientForm-value:', this.clientForm.value);
      this.send_new_client(this.clientForm.value)
    }
    else {
      this.clientForm.markAllAsTouched();
      console.log('form is not valid', this.clientForm);
    }

  }


  send_new_client(body: {}) {
    this.emp_service.edit_employee(body).subscribe({
      next: (res: any) => {
        if (res.message == "نجاح ") {
          console.log(res);
          this.show_succes_alert()
          this.clientForm.reset();
          this.clientForm.get("role")?.setValue('user')
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
        console.log(err.error.errors);
        Swal.fire(
          "خطأ", err.error.message, "error"
        )
      }
    })
  }


  show_succes_alert() {
    Swal.fire({
      title: `تم التعديل بنجاح`,
      text: `  تم تعديل بيانات العميل بنجاح`,
      icon: 'success',
      // showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      // cancelButtonColor: '#3085d6',
      confirmButtonText: 'موافق',
      // cancelButtonText: 'اضافة جديد + ' 
    }).then((result) => {
      this.router.navigate(['employees'])
    });
  }

  get_permissions() {

    let user_role = localStorage.getItem('user_role')
    console.log(user_role);
    if (user_role == 'Admin') {
      this.is_admin = true
    }
    else {
      this.is_admin = false
    }
  }


}
