import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // ✅ أضفهم
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { Ihotel } from '../../core/models/ihotel';
import { Itaskeen } from '../../core/models/itaskeen';
import { HotelsService } from '../../core/services/hotels.service';
import { TaskeenService } from '../../core/services/taskeen.service';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { Reservation } from '../../core/models/reservation.model';
import { AdminsService } from '../../core/services/admins.service';
import { EmployeesService } from '../../core/services/employees.service';
import { Iemployee } from '../../core/models/iemployee';


@Component({
  selector: 'app-operation-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, EnumPipe],
  templateUrl: './operation-page.component.html',
  styleUrl: './operation-page.component.scss'
})
export class OperationPageComponent {
  table_head_titles: string[] = [
    'اسم المستخدم', 'رقم الجوال', 'رقم الهوية', 'الجنسية', 'النوع'
  ];
  all_hotels: Ihotel[] = [];
  all_reservations: Reservation[] = [];
  // all_taskeen: Itaskeen[] = [];
  all_admins: Iemployee[] = [];
  all_employees: Iemployee[] = [];

  // private readonly Taskeen_Service = inject(TaskeenService);
  private readonly Admin_Service = inject(AdminsService);
  private readonly Employee_Service = inject(EmployeesService);
  private readonly router = inject(Router);

  // private readonly Hotel_Service = inject(HotelsService);
  private readonly fb = inject(FormBuilder); // ✅

  // ✅ إنشاء formGroup
  searchForm!: FormGroup;
  search_value: string = '';
  hotel_name: string = '';
  fromDate: string = '';
  toDate: string = '';

  ngOnInit(): void {
    this.initForm();
    this.get_all_admins();
    // this.get_all_employees();
    // this.get_all_hotels();
    // this.get_all_reservations();
  }

  initForm() {
    this.searchForm = this.fb.group({
      user_type: [''],
      // fromDate: [''],
      // toDate: ['']
    });
  }

  get_all_admins() {
    this.Admin_Service.get_all_admins().subscribe({
      next: (res: any) => {
        this.all_admins = res.ok && res.data.length > 0 ? res.data : [];
        this.get_all_employees();
      }
    });
  }

  get_all_employees() {
    this.Employee_Service.get_all_employees().subscribe({
      next: (res: any) => {
        this.all_employees = res.ok && res.data.length > 0 ?[...this.all_admins, ...res.data] : [];
      }
    });
  }

  // search_reservations() {
  //   const { user_type } = this.searchForm.value;
  //   if (!user_type) {
  //     Swal.fire('خطأ', 'تأكد من اختيار نوع المستخدم ', 'error');
  //     return
  //   }
  //   this.search_value = user_type;
  //   if (user_type === 'المشرفين') {
  //     this.get_all_admins();
  //   } else if (user_type === 'الموظفين') {
  //     this.get_all_employees();
  //   }
  //   this.search_value = user_type;
  // }

  cancel_search() {
    this.searchForm.reset();
    // this.get_all_admins();
    // this.get_all_employees();
    this.search_value = '';
  }



  // tripTypeEnum: { [key: number]: string } = {
  //   1: "رحلة مفتوحة ذهاب فقط",
  //   2: "رحلة مفتوحة عودة فقط",
  //   3: "رحلة مفتوحة ذهاب وعودة",
  //   4: "تسكين",
  //   5: "رحلة ذهاب وعودة",
  //   6: "رحلة مفتوحة مكة مدينة"
  // };








  // async exportDataToExcelStyled() {

  //   if (this.all_taskeen.length === 0) {
  //     Swal.fire('غير موجود', 'لا يوجد بيانات لتصديرها ...', 'info');
  //     return;
  //   }

  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet('التسكين');

  //   const exportData = this.all_taskeen.map(res => ({
  //     'سرير فردي': res.numOfSingleBeds,
  //     'غرفة': res.reservedRooms.length,
  //     'الي تاريخ': this.formatDate(res.toDate),
  //     'من تاريخ': this.formatDate(res.fromDate),
  //     'نوع الاقامة': this.tripTypeEnum[res.stayType] || 'غير معروف',
  //     'العدد': res.totalCount,
  //     'الرجال': res.menCount + (res.gender === 1 ? 1 : 0) || '',
  //     'النساء': res.womenCount + (res.gender === 2 ? 1 : 0) || '',
  //     'رقم الحجز': res.invoiceNumber,
  //     'اسم العميل': res.clientName
  //   }));

  //   const headers = Object.keys(exportData[0]);

  //   // إعداد الأعمدة
  //   sheet.columns = headers.map(header => {
  //     const base = { header, key: header, width: 25 };
  //     if (header === 'أسماء المسافرين') {
  //       base.width = 35; // توسيع عمود أسماء المسافرين
  //     }
  //     return base;
  //   });

  //   // إضافة البيانات وتنسيقها
  //   exportData.forEach((rowData) => {
  //     const row = sheet.addRow(rowData);
  //     row.eachCell({ includeEmpty: true }, (cell) => {
  //       cell.alignment = {
  //         horizontal: 'center',
  //         vertical: 'middle',
  //         wrapText: true
  //       };
  //       cell.border = {
  //         top: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         left: { style: 'thin' },
  //         right: { style: 'thin' }
  //       };
  //     });
  //   });

  //   // تنسيق رؤوس الأعمدة
  //   sheet.getRow(1).eachCell((cell) => {
  //     cell.font = { bold: true };
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFCCCCCC' }
  //     };
  //     cell.alignment = {
  //       horizontal: 'center',
  //       vertical: 'middle',
  //       wrapText: true
  //     };
  //     cell.border = {
  //       top: { style: 'thin' },
  //       bottom: { style: 'thin' },
  //       left: { style: 'thin' },
  //       right: { style: 'thin' }
  //     };
  //   });

  //   // تلوين فقط خانة "المبلغ المتبقي" لو > 0
  //   // sheet.eachRow((row, rowIndex) => {
  //   //   if (rowIndex === 1) return;
  //   //   const cell = row.getCell('المبلغ المتبقي');
  //   //   const remaining = cell.value as number;
  //   //   if (remaining && remaining > 0) {
  //   //     cell.fill = {
  //   //       type: 'pattern',
  //   //       pattern: 'solid',
  //   //       fgColor: { argb: 'FFFFE5E5' }
  //   //     };
  //   //   }
  //   // });

  //   // صف الإجمالي
  //   const totalRow = sheet.addRow([
  //     { formula: `SUM(A2:A${exportData.length + 1})` },
  //     { formula: `SUM(B2:B${exportData.length + 1})` },
  //     { formula: `SUM(C2:C${exportData.length + 1})` },
  //     'الإجمالي',
  //     ...Array(headers.length - 4).fill('')
  //   ]);

  //   totalRow.eachCell({ includeEmpty: true }, (cell) => {
  //     cell.font = { bold: true };
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFD9EAD3' }
  //     };
  //     cell.alignment = {
  //       horizontal: 'center',
  //       vertical: 'middle',
  //       wrapText: true
  //     };
  //     cell.border = {
  //       top: { style: 'thin' },
  //       bottom: { style: 'thin' },
  //       left: { style: 'thin' },
  //       right: { style: 'thin' }
  //     };
  //   });

  //   // ⚠️ استدعاء Swal لطلب اسم الملف
  //   const { value: fileName } = await Swal.fire({
  //     title: 'أدخل اسم ملف الاكسيل',
  //     input: 'text',
  //     inputValue: `تقرير-اكسيل-التسكين-${new Date().toISOString().split('T')[0]}`,
  //     inputPlaceholder: 'مثال: تقرير التسكين',
  //     confirmButtonText: 'تحميل',
  //     // cancelButtonColor: '#b0b0b0',
  //     confirmButtonColor: '#B50D0D',
  //     cancelButtonText: 'إلغاء',
  //     showCancelButton: true,
  //     inputValidator: (value) => {
  //       if (!value) {
  //         return 'يجب كتابة اسم الملف!';
  //       }
  //       return null;
  //     }
  //   });

  //   if (fileName) {
  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //     });
  //     const finalName = `${fileName.trim()}.xlsx`;
  //     FileSaver.saveAs(blob, finalName);
  //   }
  // }



  // formatDate(dateStr: string): string {
  //   const date = new Date(dateStr);
  //   return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  // }

  show_cashflow(id: string , name: string) {
    this.router.navigate(['/cashflow', id , name]);
  }

}
