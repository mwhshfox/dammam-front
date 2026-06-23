
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  mainColor = '#6A0808';

  showCurrentPassword = false;
showPassword = false;
showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void { }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.updateForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { currentPassword, password } = this.updateForm.value;

    this.http.post('https://mwhshfox2030-001-site1.anytempurl.com/Api/Account/Update-Credentials', {
      currentPassword,
      password
    }).subscribe({
      next: () => {
        Swal.fire({
          title: 'تم التحديث بنجاح',
          text: 'تم تحديث كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى.',
          icon: 'success',
          confirmButtonColor: this.mainColor
        });
        localStorage.clear();
        this.router.navigate(['/login']);
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
}
