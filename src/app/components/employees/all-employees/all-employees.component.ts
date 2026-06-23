import { Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { EmployeesService } from '../../../core/services/employees.service';
import { Iemployee } from '../../../core/models/iemployee';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { Router, RouterLink } from '@angular/router';
import { iUser } from '../../../core/models/admins.models';
import Swal from 'sweetalert2';
import { AdminsService } from '../../../core/services/admins.service';

@Component({
  selector: 'app-all-employees',
  standalone: true,
  imports: [ EnumPipe, RouterLink],
  templateUrl: './all-employees.component.html',
  styleUrl: './all-employees.component.scss'
})
export class AllEmployeesComponent {
  // @ViewChild('myInput') myInput!: ElementRef<HTMLInputElement>;
  @ViewChild("myButton") myModal!: ElementRef<HTMLButtonElement>;
  table_head_titles: string[] = [
    '#',
    'الاسم',
    'رقم الهاتف',
    'الجنسية',
    'رقم الهوية',
    'كود المشرف',

  ]

  all_employees: Iemployee[] = []

  private currentID: string = ''
  current_name: string = ''
  can_change_password = false

  private readonly employeesService = inject(EmployeesService);
  private readonly adminService = inject(AdminsService);
  constructor(private renderer2: Renderer2 , private router: Router) { };


  ngOnInit(): void {
    this.get_all_employees()
    this.get_permissions();
    this.employeesService.current_stage.next('all')

  }


  get_all_employees() {
    this.employeesService.get_all_employees().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_employees = res.data
          console.log(this.all_employees);
        }
        console.log(res);
      }
    })
  }


  save_employee(client_data: iUser) {
    this.employeesService.current_client.next(client_data)
    console.log(client_data);
  }


  show_delete_alert(employee_name: string, employee_id: string) {
    Swal.fire({
      title: `  ${employee_name}  `,
      text: ` هل ترغب في حذف هذا الموظف نهائياً ؟ `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      cancelButtonColor: '#b0b0b0',
      confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
      cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
    }).then((result) => {
      if (result.isConfirmed) {
        this.delete_item(employee_id)
      }
    });
  }


  delete_item(item_ID: string) {
    this.employeesService.delete_employee(item_ID).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.delete_succes_alert()
          this.get_all_employees()
        }
        else {
          console.log(res);
          Swal.fire(
            "خطأ", res.message, "error"
          )
        }
      },
      error: (err) => {
        Swal.fire(
          "خطأ", err.message, "error"
        )
      }
    })
  }

  
  update_user_pass(admin_data: iUser) {
    this.adminService.current_admin.next(admin_data)

    this.router.navigate(['/update-user-password', admin_data.id])
  }

  // 6cd8e767-fa6a-479d-ac4d-1b7093cb5411
  get_permissions() {
    let user_role = localStorage.getItem('user_role')
    let userId = localStorage.getItem('userId')
    console.log(userId);
    if (userId == '6cd8e767-fa6a-479d-ac4d-1b7093cb5411') {
      this.can_change_password = true
    }
    else {
      this.can_change_password = false
    }
  }

  delete_succes_alert() {
    Swal.fire({
      title: `تم الحذف `,
      text: `  تم حذف الموظف بنجاح`,
      icon: 'success',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
    })
  }


}
