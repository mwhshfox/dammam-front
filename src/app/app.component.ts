import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AllEmployeesComponent } from "./components/employees/all-employees/all-employees.component";
import { SignInComponent } from "./components/auth/sign-in/sign-in.component";
import { AuthService } from './core/services/auth.service';
import { AsyncPipe } from '@angular/common';
import { LoadingComponent } from "./shared/components/loading/loading.component";
import { FlowbiteService } from './core/services/flowbite.service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private Auth_Service = inject(AuthService);

  title = 'Dmam-Dashboard';


  constructor(private flowbiteService: FlowbiteService) {}

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }
}
