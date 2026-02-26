import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // ✅ أضفهم
import { Reservation } from '../../../core/models/reservation.model';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { TaskeenService } from '../../../core/services/taskeen.service';
import { HotelsService } from '../../../core/services/hotels.service';
import { Ihotel } from '../../../core/models/ihotel';
import { Itaskeen } from '../../../core/models/itaskeen';
import { EnumPipe } from "../../../shared/pipes/enum.pipe";

@Component({
  selector: 'app-all-taskeen',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, EnumPipe],
  templateUrl: './all-taskeen.component.html',
  styleUrl: './all-taskeen.component.scss'
})

export class AllTaskeenComponent {

  table_head_titles: string[] = [
    'اسم العميل', 'رقم الحجز', 'تاريخ من - الى', 'العدد', 'رجال', 'نساء', 'الاقامة', 'غرفة ', 'سرير ',
  ];
  all_hotels: Ihotel[] = [];
  all_reservations: Reservation[] = [];
  all_taskeen: Itaskeen[] = [];

  private readonly Taskeen_Service = inject(TaskeenService);
  private readonly Hotel_Service = inject(HotelsService);
  private readonly fb = inject(FormBuilder); // ✅
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);


  // ✅ إنشاء formGroup
  searchForm!: FormGroup;
  search_value: string = '';
  hotel_name: string = '';
  fromDate: string = '';
  toDate: string = '';

  ngOnInit(): void {
    this.initForm();
    this.get_all_hotels();
    // this.get_all_reservations();
  }

  initForm() {
    this.searchForm = this.fb.group({
      hotel_Id: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  get_all_reservations() {
    this.Taskeen_Service.get_all_taskeen().subscribe({
      next: (res: any) => {
        this.all_reservations = res.ok && res.data.length > 0 ? res.data : [];
      }
    });
  }

  get_all_hotels() {
    this.Hotel_Service.get_all_hotels().subscribe({
      next: (res: any) => {
        this.all_hotels = res.ok && res.data.length > 0 ? res.data : [];
      }
    });
  }

  search_reservations() {
    const { hotel_Id, fromDate, toDate } = this.searchForm.value;
    if (!hotel_Id) {
      Swal.fire('خطأ', 'تأكد من اختيار الفندق ', 'error');
      return
    }
    this.search_value = hotel_Id;
    this.hotel_name = this.all_hotels.find(hotel => hotel.id === hotel_Id)?.name || '';
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.Taskeen_Service.get_all_taskeen(
      hotel_Id, fromDate, toDate
    ).subscribe({
      next: (res: any) => {
        this.all_taskeen = res.ok && res.data.length > 0 ? res.data : [];
        this.all_taskeen.forEach(taskeen => {
          if (taskeen.reservedRooms.length > 0) {
            taskeen.num_of_all_rooms = taskeen.reservedRooms.map(room => room.roomsCount).reduce((a, b) => a + b);
          }
        });
      },
      error: (err: any) => {
        console.log(err.error.message);
        Swal.fire('خطأ', err.error.message, 'error');
        // this.cancel_search();
      }
    });
  }

  cancel_search() {
    this.searchForm.reset();
    this.get_all_reservations();
    this.search_value = '';
    this.hotel_name = '';
    this.fromDate = '';
    this.toDate = '';
  }



  stayTypeEnum: { [key: number]: string } = {
    1: "عزاب",
    2: "عائلي",
  };



  room_types_short: { [key: number]: string } = {
    1: "فردي",
    2: "ثنائي",
    3: "ثلاثي",
    4: "رباعي",
    5: "خماسي",
    6: "سداسي",
    7: "سباعي",
    8: "ثماني",
  }




  async exportDataToExcelStyled() {

    if (this.all_taskeen.length === 0) {
      Swal.fire('غير موجود', 'لا يوجد بيانات لتصديرها ...', 'info');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('التسكين');

    const exportData = this.all_taskeen.map(res => {
      // نجهز النص اللي هيطلع للغرف
      let roomsDisplay :any = '';

      if (!res.reservedRooms || res.reservedRooms.length === 0) {
        // لو مفيش reservedRooms
        roomsDisplay = res.numOfSingleBeds || 0;
      } else {
        // لو فيه reservedRooms
        roomsDisplay = res.reservedRooms
          .map(room => `${room.roomsCount} ${this.room_types_short[room.type] || ''}`)
          .join(' | ');
      }
      return {
        'سرير': roomsDisplay,
        'غرفة': res.num_of_all_rooms || '',
        'نوع الاقامة': this.stayTypeEnum[res.stayType] || 'غير معروف',
        'العدد': res.totalCount,
        'الرجال': res.menCount || '',
        'النساء': res.womenCount || '',
        'الي تاريخ': this.formatDate(res.toDate),
        'من تاريخ': this.formatDate(res.fromDate),
        'رقم الحجز': res.invoiceNumber,
        'اسم العميل': res.clientName
      }
    });

    const headers = Object.keys(exportData[0]);

    // إعداد الأعمدة
    sheet.columns = headers.map(header => {
      const base = { header, key: header, width: 25 };
      if (header === 'أسماء المسافرين') {
        base.width = 35; // توسيع عمود أسماء المسافرين
      }
      return base;
    });

    // إضافة البيانات وتنسيقها
    exportData.forEach((rowData) => {
      const row = sheet.addRow(rowData);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // تنسيق رؤوس الأعمدة
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCCCC' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // تلوين فقط خانة "المبلغ المتبقي" لو > 0
    // sheet.eachRow((row, rowIndex) => {
    //   if (rowIndex === 1) return;
    //   const cell = row.getCell('المبلغ المتبقي');
    //   const remaining = cell.value as number;
    //   if (remaining && remaining > 0) {
    //     cell.fill = {
    //       type: 'pattern',
    //       pattern: 'solid',
    //       fgColor: { argb: 'FFFFE5E5' }
    //     };
    //   }
    // });

    // صف الإجمالي
    const totalRow = sheet.addRow([
      { formula: `SUM(A2:A${exportData.length + 1})` },
      { formula: `SUM(B2:B${exportData.length + 1})` },
      { formula: `SUM(C2:C${exportData.length + 1})` },
      'الإجمالي',
      ...Array(headers.length - 4).fill('')
    ]);

    totalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9EAD3' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // ⚠️ استدعاء Swal لطلب اسم الملف
    const { value: fileName } = await Swal.fire({
      title: 'أدخل اسم ملف الاكسيل',
      input: 'text',
      inputValue: `تقرير-اكسيل-التسكين-${new Date().toISOString().split('T')[0]}`,
      inputPlaceholder: 'مثال: تقرير التسكين',
      confirmButtonText: 'تحميل',
      // cancelButtonColor: '#b0b0b0',
      confirmButtonColor: '#B50D0D',
      cancelButtonText: 'إلغاء',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'يجب كتابة اسم الملف!';
        }
        return null;
      }
    });

    if (fileName) {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const finalName = `${fileName.trim()}.xlsx`;
      FileSaver.saveAs(blob, finalName);
    }
  }



  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }


  go_to_organize_taskeen() {
    if (!this.searchForm.value.hotel_Id || !this.searchForm.value.fromDate || !this.searchForm.value.toDate) {
      Swal.fire('استكمال البحث', 'يجب اختيار الفندق و الفترة الزمنية', 'warning');
      return;
    }

    this.router.navigate(['/organize-taskeen'], {
      queryParams: {
        hotel_Id: this.searchForm.value.hotel_Id,
        fromDate: this.searchForm.value.fromDate,
        toDate: this.searchForm.value.toDate
      }
    });
  }


}
