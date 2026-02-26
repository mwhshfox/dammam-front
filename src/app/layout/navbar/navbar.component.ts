import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'] // Corrected styleUrl to styleUrls
})
export class NavbarComponent {
  username: string | null = null;
  showUserMenu = false;

  constructor(public authService: AuthService, private Router: Router) {
    this.username = this.authService.getUsernameFromToken();
    console.log(this.username);

  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  updatePassword() {
    this.showUserMenu = false;
    this.Router.navigate(['/update-password']);
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout();
  }
}
