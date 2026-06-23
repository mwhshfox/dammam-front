import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // ✅ أضفهم
import { ReservationsService } from '../../../core/services/reservations.service';
import { Reservation } from '../../../core/models/reservation.model';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { UsersService } from '../../../core/services/users.service';
import { iUser } from '../../../core/models/admins.models';
import { TripsService } from '../../../core/services/trips.service';

@Component({
  selector: 'app-all-reservations',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './all-reservations.component.html',
  styleUrl: './all-reservations.component.scss'
})
export class AllReservationsComponent {
  constructor(private readonly datePipe: DatePipe, private readonly router: Router) { }
  // table_head_titles: string[] = [
  //   'رقم الحجز', 'تاريخ الحجز', 'اسم العميل', 'من - إلى', 'مدفوع', 'متبقي', 'قيود', 'اعدادات',
  // ];


  all_reservations: Reservation[] = [];

  private readonly reservationsService = inject(ReservationsService);
  private readonly fb = inject(FormBuilder); // ✅
  private readonly users_Service = inject(UsersService);
  private readonly tripsService = inject(TripsService);


  // ✅ إنشاء formGroup
  searchForm!: FormGroup;
  search_value: string = '';
  today_date: string = '';
  fromDate_search: string = '';
  toDate_search: string = '';

  is_admin: boolean = false;

  // user_assigned_to_qyoud: boolean = false;

  Employee_info: iUser = {} as iUser;

  search_mode: 'createdOn' | 'fromdate' = 'createdOn';
  public isDeletedView = false;

  ngOnInit(): void {
    this.isDeletedView = this.router.url.includes('/reservations/deleted');
    this.initForm();
    // this.get_date_range();
    // this.get_all_reservations();
    this.get_user_by_id()
    this.search_reservations();
    this.get_permissions()
    this.today_date = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    console.log('Today date:', this.today_date);
  }

  onEditReservation(reservation: Reservation) {
    this.guardReservationAction(reservation, () => {
      this.router.navigate(['/Edit-Reservation', reservation.id]);
    });
  }

  onDeleteReservation(reservation: Reservation) {
    this.guardReservationAction(reservation, () => this.show_delete_alert(reservation.id));
  }

  private guardReservationAction(reservation: Reservation, onAllowed: () => void) {
    const fallbackDate = reservation.toDate || reservation.fromDate;
    if (!reservation.tripId) {
      if (this.isDateInFuture(fallbackDate)) {
        onAllowed();
      } else {
        this.showExpiredAlert();
      }
      return;
    }

    this.tripsService.get_trip_by_id(reservation.tripId).subscribe({
      next: (res: any) => {
        const trip = res.ok ? res.data : null;
        const endDate = trip?.returnTime || fallbackDate;
        if (this.isDateInFuture(endDate)) {
          onAllowed();
        } else {
          this.showExpiredAlert();
        }
      },
      error: () => this.showExpiredAlert()
    });
  }

  private isDateInFuture(dateStr?: string): boolean {
    if (!dateStr) {
      return false;
    }
    return dateStr >= this.today_date;
  }

  private showExpiredAlert(): void {
    Swal.fire({
      icon: 'warning',
      title: 'لا يمكن تعديل/حذف هذا الحجز',
      text: 'انتهت رحلة هذا الحجز بالفعل.'
    });
  }

  initForm() {
    this.searchForm = this.fb.group({
      invoiceNumber: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  get_all_reservations() {
    this.reservationsService.get_all_reservations().subscribe({
      next: (res: any) => {
        this.all_reservations = res.ok && res.data.length > 0 ? res.data : [];
      }
    });
  }

  go_deleted_reservations(){
    // Navigate to deleted reservations page
    // Implement the navigation logic here
    this.router.navigate(['/reservations/deleted']);
  }

  go_all_reservations(){
    this.router.navigate(['/reservations']);
  }


  get_date_range() {
    let startDate: Date;
    const endDate = new Date();

    startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    this.fromDate_search = this.datePipe.transform(startDate, 'yyyy-MM-dd') || '';
    this.toDate_search = this.datePipe.transform(endDate, 'yyyy-MM-dd') || '';
    // this.searchForm.patchValue({
    //   fromDate: this.fromDate_search,
    //   toDate: this.toDate_search
    // });
  }

  search_reservations() {
    const { invoiceNumber, fromDate, toDate } = this.searchForm.value;
    if (!invoiceNumber && !fromDate && !toDate) {
      let startDate = new Date();
      const endDate = new Date();

      endDate.setDate(endDate.getDate() + 20);
      startDate.setDate(startDate.getDate() - 10);


      this.fromDate_search = this.datePipe.transform(startDate, 'yyyy-MM-dd') || '';
      this.toDate_search = this.datePipe.transform(endDate, 'yyyy-MM-dd') || '';

      this.reservationsService.get_all_reservations(
        invoiceNumber,
        this.fromDate_search,
        this.toDate_search,
        this.fromDate_search,
        this.toDate_search,
        this.search_mode,
        this.isDeletedView
      ).subscribe({
        next: (res: any) => {
          this.all_reservations = res.ok && res.data.length > 0 ? res.data : [];
        },
        error: (err: any) => {
          console.log(err.error.message);
          Swal.fire('خطأ', err.error.message, 'error');
          this.cancel_search();
        }
      });

      return
    }

    this.search_value = invoiceNumber;
    this.fromDate_search = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.toDate_search = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';

    this.reservationsService.get_all_reservations(invoiceNumber ,this.fromDate_search ,this.toDate_search ,this.fromDate_search ,this.toDate_search ,this.search_mode,this.isDeletedView
    ).subscribe({
      next: (res: any) => {
        this.all_reservations = res.ok && res.data.length > 0 ? res.data : [];
      },
      error: (err: any) => {
        console.log(err.error.message);
        Swal.fire('خطأ', err.error.message, 'error');
        this.cancel_search();
      }
    });
  }

  cancel_search() {
    this.searchForm.reset();
    // this.get_all_reservations();
    this.search_value = '';
    this.fromDate_search = '';
    this.toDate_search = '';
    this.search_reservations();
  }

  show_delete_alert(id: string) {
    Swal.fire({
      text: ` هل ترغب في حذف هذا الحجز نهائياً ؟ `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      cancelButtonColor: '#b0b0b0',
      confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
      cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
    }).then((result) => {
      if (result.isConfirmed) this.delete_reservation(id);
    });
  }

  delete_reservation(id: string) {
    this.reservationsService.delete_reservation(id).subscribe({
      next: (res: any) => {
        if (res.ok) this.search_reservations();
      }
    });
  }

  export_qiod_invoice(reservation_id: string, qyoud_invoice_id: string, index: number) {
    if (qyoud_invoice_id) {
      Swal.fire({
        text: 'هذا الحجز مسجل بالفعل في نظام قيود هل ترغب في الغاء تسجيله',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#B50D0D',
        cancelButtonColor: '#b0b0b0',
        confirmButtonText: 'الغاء التسجيل  <i class="fa-solid fa-trash-can"></i>',
        cancelButtonText: 'تراجع <i class="fa-solid fa-xmark"></i>'
      }).then((result) => {
        if (result.isConfirmed) this.delete_qyoud_invoice(reservation_id, index);
      });
      return
    }
    this.reservationsService.export_qiod_invoice(reservation_id).subscribe({
      next: (res: any) => {
        console.log("قيووووود فاتورة ############## ", res);
        if (res.ok) {
          Swal.fire('نجاح', res.message || 'تم تصدير الفاتورة الي نظام قيود بنجاح', 'success');
          this.all_reservations[index].qoyodInvoiceId = res.data;
        } else {
          Swal.fire('خطأ', res.message || 'حدث خطأ أثناء تصدير الفاتورة', 'error');
        }
      },
      error: (err: any) => {
        console.log(err);
        Swal.fire('خطأ', err.error.message, 'error');
      }
    });
  }
  export_qiod_payment(reservation_id: string, qyoud_payment_id: string, index: number) {

    if (qyoud_payment_id) {
      return
    }

    this.reservationsService.export_qiod_payment(reservation_id).subscribe({
      next: (res: any) => {
        console.log("قيووووود سند ############## ", res);
        if (res.ok) {
          Swal.fire('نجاح', res.message || 'تم تصدير السند الي نظام قيود بنجاح', 'success');
          this.all_reservations[index].qoyodPaymentId = res.data;
        } else {
          Swal.fire('خطأ', res.message || 'حدث خطأ أثناء تصدير السند', 'error');
        }
      },
      error: (err: any) => {
        console.log(err);
        Swal.fire('خطأ', err.error.message, 'error');
      }
    });
  }


  delete_qyoud_invoice(reservation_id: string, index: number) {
    this.reservationsService.delete_qyoud_invoice(reservation_id).subscribe({
      next: (res: any) => {
        console.log("قيووووود فاتورة ############## ", res);
        if (res.ok) {
          Swal.fire('نجاح', res.data || 'تم حذف الفاتورة من نظام قيود بنجاح', 'success');
          this.all_reservations[index].qoyodInvoiceId = "";
        } else {
          Swal.fire('خطأ', res.data || 'حدث خطأ أثناء حذف الفاتورة', 'error');
        }
      },
      error: (err: any) => {
        console.log(err);
        Swal.fire('خطأ', err.error.message, 'error');
      }
    });
  }

  get_user_by_id() {

    let user_id = localStorage.getItem('userId')
    if (!user_id) return

    this.users_Service.get_user_by_id(user_id).subscribe({
      next: (res: any) => {
        console.log("res", res);
        this.Employee_info = res.data
        // this.user_assigned_to_qyoud = this.Employee_info.qoyodId ? true : false
      },
      error: (err: any) => {
        console.log("err", err);
      }
    });
  }


  // export to excel ==========================================

  tripTypeEnum: { [key: number]: string } = {
    1: "رحلة مفتوحة ذهاب فقط",
    2: "رحلة مفتوحة عودة فقط",
    3: "رحلة مفتوحة ذهاب وعودة",
    4: "تسكين",
    5: "رحلة ذهاب وعودة",
    6: "رحلة مفتوحة مكة مدينة"
  };

  pamentEnum: { [key: number]: string } = {
    1: "كاش",
    3: "تحويل",
    2: "شبكة",
    4: "خصم",
  };


  async exportDataToExcelStyled() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('الحجوزات');

    const exportData = this.all_reservations.map(res => ({
      'المبلغ المتبقي': res.remainingMoney,
      'المبلغ المدفوع': res.moneyPaid,
      'إجمالي الفاتورة': res.totalInvoice,
      'طريقة الدفع': this.pamentEnum[res.paymentMethod] || 'غير معروف',
      'موظف الحجز': res.employeeName,
      'اسم الفندق': res.hotelName || '—',
      'نوع الرحلة': this.tripTypeEnum[res.tripTicketType] || 'غير معروف',
      'إلى تاريخ': this.datePipe.transform(res.toDate, 'yyyy-MM-dd (EEEE)', '', 'ar-EG'),
      'من تاريخ': this.datePipe.transform(res.fromDate, 'yyyy-MM-dd (EEEE)', '', 'ar-EG'),
      'تاريخ الحجز': this.datePipe.transform(res.createdOn, 'yyyy-MM-dd - hh:mm', '', 'ar-EG') + ' ' + this.datePipe.transform(res.createdOn, 'a', '', 'ar-EG'),
      'أسماء المسافرين': res.usersFullNames?.join('') || '',
      'رقم الحجز': res.invoiceNumber
    }));

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
    sheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return;
      const cell = row.getCell('المبلغ المتبقي');
      const remaining = cell.value as number;
      if (remaining && remaining > 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE5E5' }
        };
      }
    });

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
      inputValue: `تقرير-اكسيل-الحجوزات-${new Date().toISOString().split('T')[0]}`,
      inputPlaceholder: 'مثال: تقرير الحجوزات',
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


    get_trip_by_id(trip_id: string, chairs_data: any) {
    this.tripsService.get_trip_by_id(trip_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          const trip = res.data
          // trip.reserved_chairs = chairs_data
          // this.trips_details.push(trip);
          // console.log('tdeeeeeeeeeeeeeeeeeee', this.trips_details);
          console.log(res);
        }
      }
    })
  }



  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }


  get_permissions() {
    let user_role = localStorage.getItem('user_role')
    console.log(user_role);
    if (user_role == 'Admin') {
      this.is_admin = true
    }
    else {
      this.is_admin = false
    }
  }



}

