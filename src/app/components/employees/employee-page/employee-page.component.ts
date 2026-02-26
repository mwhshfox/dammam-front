import { Component, Renderer2, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { iUser } from '../../../core/models/admins.models';
import { EmployeesService } from '../../../core/services/employees.service';

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './employee-page.component.html',
  styleUrl: './employee-page.component.scss'
})
export class EmployeePageComponent {


  private currentID: string = '';
  private readonly employeesService = inject(EmployeesService);
  private readonly router = inject(Router);
  constructor(private renderer2: Renderer2) { };



  all_emps: iUser[] = []
  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_path()
    this.get_current_stage()
  }



  save_employee_Id(id: string, name: string) {
    this.currentID = id
    this.current_name = name
  }



  get_path() {
    this.router.url == "/admin/all-admins" ? this.show_add_new = true : this.show_add_new = false
    console.log(this.router.url);
  }


  get_current_stage() {
    this.employeesService.current_stage.subscribe((value) => {
      setTimeout(() => {
        this.current_stage = value
        console.log(value);

      }, 0);
    })
  }


}
