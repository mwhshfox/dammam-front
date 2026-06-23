import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor() { }

  platformId = inject(PLATFORM_ID);

  show_loader = new BehaviorSubject(false)


}
