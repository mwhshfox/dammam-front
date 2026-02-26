import { Component } from '@angular/core';
import { AllReservationsComponent } from '../../components/reservations/all-reservations/all-reservations.component';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ NavbarComponent, SidebarComponent , RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
