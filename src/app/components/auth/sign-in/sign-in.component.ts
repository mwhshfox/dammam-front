import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  loginMethod: 'email' | 'phone' = 'email';
  phoneStep: 'enter' | 'verify' = 'enter';
  otpArray = Array(5).fill(0);

  loginForm_user_pass!: FormGroup;
  loginForm_phone_otp!: FormGroup;
  phoneToVerify: string = '';
  private readonly router = inject(Router);
  platformId = inject(PLATFORM_ID);
  wrong_login_data: boolean = false;
  error_message: string = '';

  constructor(private fb: FormBuilder, private auth_service: AuthService) {
    this.initForms();
  }

  initForms() {
    this.loginForm_user_pass = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required]],
    });

    this.loginForm_phone_otp = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      digit0: [''],
      digit1: [''],
      digit2: [''],
      digit3: [''],
      digit4: [''],
    });
  }


  check_phone_send_otp() {
    if (this.loginForm_phone_otp.get('phoneNumber')?.valid) {
      this.phoneToVerify = this.loginForm_phone_otp.get('phoneNumber')?.value;
      this.send_otp_phone(this.phoneToVerify);
    }
  }
  check_email_login() {
    if (this.loginForm_user_pass.valid) {
      this.login_by_email_pass(this.loginForm_user_pass.value);
    }
  }

  send_otp_phone(phoneNumber: string) {
    const body = { phoneNumber: phoneNumber }
    this.auth_service.send_otp_phone(body).subscribe({
      next: (res) => {
        if (res.ok) {
          console.log('OTP sent successfully');
          this.phoneStep = 'verify';
        } else {
          console.log('Failed to send OTP');
        }
      },
      error: (err) => {
        console.log(err);
        this.wrong_login_data = true;
        this.error_message = err.error.message;
      }
    })
  }



  backToPhoneEntry() {
    this.phoneStep = 'enter';
  }

  handleOtpInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;
    if (value && index < 4) {
      const next = input.parentElement.querySelector(`[data-index="${index + 1}"]`);
      if (next) next.focus();
    }
  }

  handleOtpKeyDown(event: any, index: number) {
    const input = event.target;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = input.parentElement.querySelector(`[data-index="${index - 1}"]`);
      if (prev) prev.focus();
    }
  }

  // loginWithEmail() {
  //   if (this.loginForm_user_pass.valid) {
  //     const credentials = this.loginForm_user_pass.value;
  //     this.login_by_otp(credentials);
  //   }
  // }





  loginWithPhone() {
    const otp = this.otpArray.map((_, i) => this.loginForm_phone_otp.get('digit' + i)?.value).join('');
    const phoneNumber = this.phoneToVerify;

    console.log(phoneNumber, otp);
    this.login_by_otp({
      "phoneNumber": phoneNumber,
      'otp': otp
    });
  }

  login_by_otp(body: {}) {
    this.wrong_login_data = false;
    this.auth_service.login_by_otp(body).subscribe({
      next: (res) => {
        if (res.ok) {
          this.save_user_data(res);
          this.router.navigate(['/home']);
          console.log('Login successful');
        } else {
          console.log('Login failed');
          this.wrong_login_data = true;
        }
      },
      error: (err) => {
        console.log('errorrrrrrrrrr', err.error);
      }
    })
  }


  login_by_email_pass(body: {}) {
    this.wrong_login_data = false;
    this.auth_service.login_email_pass(body).subscribe({
      next: (res) => {
        if (res.ok) {
          this.save_user_data(res);
          this.router.navigate(['/home']);
          console.log('Login successful');
        } else {
          console.log('Login failed');
          this.wrong_login_data = true;
        }
      },
      error: (err) => {
        console.log('errorrrrrrrrrr', err.error.message);
        this.wrong_login_data = true;
        this.error_message = err.error.message;
      }
    })
  }




  save_user_data(data: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', data.data.token);
      // localStorage.setItem('user_name', data.data.username);
      localStorage.setItem('user_role', data.data.roles);
      this.auth_service.storeUserIdFromToken();
    }
  }





  switchLoginMethod() {
    this.wrong_login_data = false;
    this.error_message = '';
    this.loginMethod = this.loginMethod === 'email' ? 'phone' : 'email';
    this.phoneStep = 'enter';
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }
}
