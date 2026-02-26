import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ClientsService } from '../../../core/services/clients.service';
import { Iclient } from '../../../core/models/iclient';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './client-page.component.html',
  styleUrl: './client-page.component.scss'
})
export class ClientPageComponent {
  private readonly client_Service = inject(ClientsService);
  private readonly router = inject(Router);
  constructor() { };


  all_clients: Iclient[] = []
  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_path()
    this.get_current_stage()
    // this.get_all_client()
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
    this.client_Service.current_stage.subscribe((value) => {
      setTimeout(() => {
        this.current_stage = value
        console.log(value);

      }, 0);
    })
  }

  get_all_client() {
    this.client_Service.get_all_clients().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_clients = res.data
          console.log(this.all_clients);
        }
        console.log(res);
      }
    })
  }

  
    
    async exportLastClientsToExcel() {
      if (!this.all_clients || this.all_clients.length === 0) {
        Swal.fire('لا يوجد عملاء', 'لا توجد بيانات لتصديرها!', 'info');
        return;
      }
    
      // اسأل المستخدم كم عدد العملاء اللي عاوزهم
      const { value: countStr } = await Swal.fire({
        title: 'عدد العملاء',
        input: 'number',
        inputPlaceholder: 'أدخل عدد آخر العملاء المراد تصديرهم',
        inputAttributes: {
          min: '1',
          max: this.all_clients.length.toString()
        },
        confirmButtonText: 'استمرار',
        showCancelButton: true,
        cancelButtonText: 'إلغاء',  
        inputValidator: (value) => {
          const num = Number(value);
          if (!value || isNaN(num) || num <= 0) {
            return 'من فضلك أدخل رقمًا صحيحًا';
          }
          return null;
        }
      });
    
      if (!countStr) return;
    
      const count = Number(countStr);
      const selectedClients = this.all_clients.slice(0 , count); // آخر N عميل
    
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('العملاء');
    
      const exportData = selectedClients.map(client => ({
        'الجنس': client.gender === 1 ? 'ذكر' : 'أنثى',
        'الصفة': client.isCompanion === true ? ' مرافق ' : 'عميل',
        'الجنسية': this.all_nationality[client.nationality] ,
        'رقم الجوال': client.phoneNumber,
        'رقم الهوية / الإقامة': client.nationalityId,
        'تاريخ التسجيل': new Date(client.createdOn).toLocaleDateString('ar-EG'),
        'الاسم الكامل': client.fullName,
      }));
    
      // إعداد الأعمدة
      const headers = Object.keys(exportData[0]);
      sheet.columns = headers.map(header => ({
        header,
        key: header,
        width: 25
      }));
    
      // إضافة البيانات
      exportData.forEach(rowData => {
        const row = sheet.addRow(rowData);
        row.eachCell(cell => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    
      // تنسيق الرؤوس
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' }
        };
      });
    
      // طلب اسم الملف
      const { value: fileName } = await Swal.fire({
        title: 'أدخل اسم الملف',
        input: 'text',
        inputValue: `تقرير-عملاء-${new Date().toISOString().split('T')[0]}`,
        confirmButtonText: 'تحميل',
        showCancelButton: true,
        inputValidator: value => {
          if (!value) return 'الرجاء إدخال اسم الملف';
          return null;
        }
      });
    
      if (fileName) {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        FileSaver.saveAs(blob, `${fileName}.xlsx`);
      }
    }
  
  
    all_nationality: { [key: number]: string } = {
      0: "مصري",
      1: "سعودي",
      2: "إماراتي",
      3: "قطري",
      4: "كويتي",
      5: "بحريني",
      6: "عماني",
      7: "أردني",
      8: "لبناني",
      9: "سوري",
      10: "فلسطيني",
      11: "عراقي",
      12: "ليبي",
      13: "تونسي",
      14: "جزائري",
      15: "مغربي",
      16: "سوداني",
      17: "موريتاني",
      18: "يمني"
    };
  
    

}
