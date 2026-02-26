import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  user_role: string = '';

  ngOnInit(): void {
    this.get_user_role();
  }
  get_user_role() {
    this.user_role = localStorage.getItem('user_role') || '';
  }
}
