import { Component, inject } from '@angular/core';
import { ConfirmPopupComponent } from "../../../shared/components/confirm-popup/confirm-popup.component";
import { Iclient } from '../../../core/models/iclient';
import { ClientsService } from '../../../core/services/clients.service';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { iUser } from '../../../core/models/admins.models';
import { RouterLink } from '@angular/router';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-all-clients',
  standalone: true,
  imports: [EnumPipe, RouterLink, FormsModule],
  templateUrl: './all-clients.component.html',
  styleUrl: './all-clients.component.scss'
})
export class AllClientsComponent {
  table_head_titles: string[] = [
    '#',
    'الاسم',
    'رقم الهاتف',
    'الجنسية',
    'رقم الهوية',
    'النوع',
  ]

  all_clients: Iclient[] = []

  private currentID: string = ''
  current_name: string = ''
  searchInput: string = ''
  private readonly clientService = inject(ClientsService);
  constructor() { };

  ngOnInit(): void {
    this.get_all_client()
    this.clientService.current_stage.next('all')
  }

  get_searched_client() {

    if (this.searchInput == '') {
      // this.get_all_client()
      Swal.fire('تنبيه', 'يجب ملئ البحث', 'warning')
      return
    }

    this.clientService.get_searched_client(this.searchInput).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_clients = res.data
          console.log(this.all_clients);
        }
        console.log(res);
      }
    })
  }

  cancel_search() {
    this.searchInput = '';
    this.get_all_client();
  }

  get_all_client() {
    this.clientService.get_all_clients().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_clients = res.data
          console.log(this.all_clients);
        }
        console.log(res);
      }
    })
  }

  save_client(client_data: Iclient) {
    this.clientService.current_client.next(client_data)
    console.log(client_data);
  }



  show_delete_alert(employee_name: string, employee_id: string) {
    Swal.fire({
      title: `  ${employee_name}  `,
      text: ` هل ترغب في حذف هذا العميل نهائياً ؟ `,
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
    this.clientService.delete_client(item_ID).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.delete_succes_alert()
          this.get_all_client()
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


  delete_succes_alert() {
    Swal.fire({
      title: `تم الحذف `,
      text: `  تم حذف العميل بنجاح`,
      icon: 'success',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
    })
  }


}
