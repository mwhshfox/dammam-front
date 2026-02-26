import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { api_base_url } from '../../app.config';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
interface OtpResponse {
  ok: boolean;
  // add other properties as needed, e.g. message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiJiNmUxNzA4MS00NzZlLTQ5OWUtOTVlOS1jMzQ4NmFjYmVhOWUiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ1MjM1NTcyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.rK4gyB7dtqtehXGLjSfgiHDtWcQbc0FGcCv2-yR-U4E"

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }
  // show_loader = new BehaviorSubject(false)
  current_client = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")
  platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  private readonly router = inject(Router);

  send_otp_phone(body: {}): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(this.base_url + 'Account/Send-Otp',
      body,
    );
  }


  login_by_otp(body: {}): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(this.base_url + 'Account/LoginByOtp',
      body,
    );
  }


  // دالة للتحقق من تسجيل الدخول
  isLoggedIn(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  // دالة لفك التوكن وإرجاع اسم المستخدم
  getUsernameFromToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const tokenParts = pureToken.split('.');

      if (tokenParts.length !== 3) return null;

      // تحويل payload من base64 إلى UTF-8
      const payloadBase64 = tokenParts[1];
      const decodedPayload = decodeURIComponent(
        escape(window.atob(payloadBase64))
      );
      const payload = JSON.parse(decodedPayload);

      return payload.sub || null;
    } catch {
      return null;
    }
  }

  // دالة لتسجيل الخروج
  logout(): void {
    console.log("logoutssssssssssssssss");

    if (this.isBrowser) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
    // يمكنك هنا إعادة التوجيه لصفحة تسجيل الدخول
  }


  login_email_pass(body: {}): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(this.base_url + 'Account/login-as-admin',
      body,
    )
  }



  storeUserIdFromToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;
  
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const tokenParts = pureToken.split('.');
  
      if (tokenParts.length !== 3) return;
  
      const payloadBase64 = tokenParts[1];
      const decodedPayload = decodeURIComponent(
        escape(window.atob(payloadBase64))
      );
      const payload = JSON.parse(decodedPayload);
  
      const userId = payload.uid;
      if (userId) {
        localStorage.setItem('userId', userId);
      }
    } catch {
      // في حالة الخطأ، ممكن نسجله أو نتجاهله
      console.error('Failed to store user ID from token.');
    }
  }



}
