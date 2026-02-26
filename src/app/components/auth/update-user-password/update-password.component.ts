
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminsService } from '../../../core/services/admins.service';
import { iUser } from '../../../core/models/admins.models';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent implements OnInit {
  updateForm: FormGroup;
  isLoading = false;
  current_admin: iUser = {} as iUser
  is_admin: boolean = false
  mainColor = '#6A0808';
  user_name: string = ''

  showCurrentPassword = false;
  showPassword = false;
  showConfirmPassword = false;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private adminsService: AdminsService
  ) {
    this.updateForm = this.fb.group({
      userId: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {

    this.get_current_admin();
    this.get_permissions();

    const userId = this.activatedRoute.snapshot.paramMap.get('user_id');
    if (userId) {
      this.updateForm.patchValue({ userId });
    }
    else {
      this.router.navigate(['/home']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.updateForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { userId, newPassword } = this.updateForm.value;

    this.http.post('https://mwhshfox2030-001-site1.anytempurl.com/Api/Account/Admin-Reset-Password', {
      userId,
      newPassword
    }).subscribe({
      next: () => {
        Swal.fire({
          title: 'تم التحديث بنجاح',
          text: 'تم تحديث كلمة المرور بنجاح.',
          icon: 'success',
          confirmButtonColor: this.mainColor
        });
        // localStorage.clear();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'خطأ',
          text: err.error?.message || 'حدث خطأ أثناء تحديث كلمة المرور',
          icon: 'error',
          confirmButtonColor: this.mainColor
        });
      }
    });
  }

  get f() {
    return this.updateForm.controls;
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

    this.user_name = this.current_admin.fullName
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