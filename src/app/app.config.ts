import { ApplicationConfig, importProvidersFrom, InjectionToken, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorsInterceptor } from './core/interceptors/errors.interceptor';

// api Base Url
export const api_base_url = new InjectionToken<string>('');

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),
  provideHttpClient( withFetch(), withInterceptors([authInterceptor, loadingInterceptor, errorsInterceptor])),
  { provide: api_base_url, useValue: 'https://mwhshfox2030-001-site1.anytempurl.com/Api/' },
  // { provide: api_base_url, useValue: 'https://dammam-stging.runasp.net/Api/' },
  importProvidersFrom(SweetAlert2Module.forRoot())]
};

