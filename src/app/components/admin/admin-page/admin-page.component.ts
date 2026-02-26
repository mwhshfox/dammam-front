import { Component, inject } from '@angular/core';
import { iUser } from '../../../core/models/admins.models';
import { AdminsService } from '../../../core/services/admins.service';
import { NewAdminComponent } from "../new-admin/new-admin.component";
import { AllAdminsComponent } from "../all-admins/all-admins.component";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {
  private readonly adminService = inject(AdminsService);
  private readonly router = inject(Router);
  constructor() { };


  all_Admins: iUser[] = []
  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_path()
    this.get_current_stage()
  }




  show_add_new_button() {
    this.show_add_new = true
  }
  hide_add_new_button() {
    this.show_add_new = false
  }

  get_path() {
    this.router.url == "/admin/all-admins" ? this.show_add_new = true : this.show_add_new = false
    console.log(this.router.url);
  }

  get_current_stage() {
    this.adminService.current_stage.subscribe((value) => {
      setTimeout(() => {
        this.current_stage = value
      }, 0);
    })
  }

}
