import { Component, inject } from '@angular/core';
import { iUser } from '../../../core/models/admins.models';
import { AdminsService } from '../../../core/services/admins.service';
import { ConfirmPopupComponent } from "../../../shared/components/confirm-popup/confirm-popup.component";
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-admins',
  standalone: true,
  imports: [ConfirmPopupComponent, EnumPipe, RouterLink],
  templateUrl: './all-admins.component.html',
  styleUrl: './all-admins.component.scss'
})
export class AllAdminsComponent {
  private readonly adminService = inject(AdminsService);
  constructor(private router: Router) { };


  table_head_titles: string[] = [
    '#',
    'الاسم',
    'رقم الهاتف',
    'الجنسية',
    'رقم الهوية',
    'كود المشرف',
  ]

  all_Admins: iUser[] = []
  private currentID: string = ''
  current_name: string = ''
  isModalVisible = false;
  show_add_new = false;
  show_all_admins = true
  can_change_password = false



  ngOnInit(): void {
    this.get_all_admins();
    this.get_permissions();
    this.adminService.current_admin.next({})
    this.adminService.current_stage.next('all')
  }

  get_all_admins() {
    this.adminService.get_all_admins().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_Admins = res.data
          console.log(this.all_Admins);
        }
        console.log(res);
      }
    })
  }

  save_admin(admin_data: iUser) {
    this.adminService.current_admin.next(admin_data)
    console.log(admin_data);
  }


  
  
  show_delete_alert(ADMIN_name: string, ADMIN_id: string) {
    Swal.fire({
      title: `  ${ADMIN_name}  `,
      text: ` هل ترغب في حذف هذا المشرف نهائياً ؟ `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      cancelButtonColor: '#b0b0b0',
      confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
      cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
    }).then((result) => {
      if (result.isConfirmed) {
        this.delete_item(ADMIN_id)
      }
    });
  }


  delete_item(item_ID: string) {
    if (item_ID == "45aff04e-ab13-4570-ad7d-4d44f2ea0994") {
      Swal.fire({
        title: `غير مسموح`,
        text: ` هذا المشرف خاص باغراض التطوير و البرمجة ولا يمكن حذفه بشكل يدوي `,
        icon: 'error',
        confirmButtonColor: '#B50D0D'
      })
      return
    }
    this.adminService.delete_admin(item_ID).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.delete_succes_alert()
          this.get_all_admins()
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
      text: `  تم حذف المشرف بنجاح`,
      icon: 'success',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
    })
  }



}
