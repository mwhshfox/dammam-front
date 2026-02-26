import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Itransaction, PaymentMethod } from '../../core/models/itransaction';
import { CashflowService } from '../../core/services/cashflow.service';
import { EnumPipe } from "../../shared/pipes/enum.pipe";
import { AdminsService } from '../../core/services/admins.service';
import { EmployeesService } from '../../core/services/employees.service';
import { Iemployee } from '../../core/models/iemployee';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
// import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-all-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, EnumPipe],
  providers: [DatePipe],
  templateUrl: './all-operations.component.html',
  styleUrl: './all-operations.component.scss'
})
export class AllOperationsComponent {

  ryal: string = `<svg class="inline-block" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1"
                            width="17" height="17" fill="currentColor" viewBox="0 0 1124.14 1256.39">
                            <path
                                d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
                            <path
                                d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
                        </svg>`;
  TotalInvoices: number = 0;
  TotalPaid: number = 0;
  Remaining: number = 0;
  Transactions: number = 0;

  searchDate: string = '';

  all_employees: Iemployee[] = [];
  selectedEmployeeId: string | null = null;
  currentFromDate: string = '';
  currentToDate: string = '';

  // بيانات المعاملات
  transactions: Itransaction[] = [];

  filteredTransactions: Itransaction[] = [];
  searchTerm: string = '';
  sourceFilter: string = 'all';
  paymentFilter: number = 0;
  user_id: string = '';
  user_name: string = '';
  constructor(
    private datePipe: DatePipe,
    private cashflowService: CashflowService,
    private adminService: AdminsService,
    private emp_service: EmployeesService,
    private actRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.filteredTransactions = [...this.transactions];

    // this.get_all_transactions('2025-07-01', '2025-07-31');

    // this.updateDateRange();
    // this.get_All_employees()
    this.getAllEmployees();

    this.actRoute.params.subscribe((params) => {
      this.user_id = params['user_id'];
      this.user_name = params['user_name'];
      this.selectedEmployeeId = this.user_id || null;

      console.log('user_name', this.user_name);
      console.log('user_id', this.user_id);

      this.updateDateRange();
    })
  }

  get_all_transactions(user_id: string | null | undefined, fromDate: string, toDate: string): void {
    this.cashflowService.get_all_transactions(user_id, fromDate, toDate).subscribe({
      next: (data: any) => {
        this.transactions = data.data;
        this.filteredTransactions = [...this.transactions];
        this.calculateFilteredTotals();

        this.filterTransactions();
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      }
    })
  }

  // في الكومبوننت
  timeRangeOptions = [
    { value: '1', label: 'اليوم فقط' },
    { value: '3', label: 'آخر 3 أيام' },
    { value: '7', label: 'آخر 7 أيام' },
    { value: '30', label: 'الشهر الحالي' },
    { value: 'custom', label: 'مخصص' }
  ];

  selectedRange = '3'; // القيمة الافتراضية

  updateDateRange() {
    let startDate: Date;
    const endDate = new Date();

    switch (this.selectedRange) {
      case 'today':
        startDate = new Date(endDate);
        break;
      case 'yesterday':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case '3':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 2);
        break;
      case '7':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        break;
      case 'currentMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'custom':
        // استخدم date picker هنا
        this.openCustomDatePicker();
        return;
      default:
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 2); // افتراضي: آخر 3 أيام
    }

    if (this.formatDate(startDate, 'yyyy-mm-dd') == this.formatDate(endDate, 'yyyy-mm-dd')) {
      this.searchDate = this.formatDate(startDate, 'yyyy-mm-dd');
    } else {
      this.searchDate = this.formatDate(startDate, 'yyyy-mm-dd') + ' - ' + this.formatDate(endDate, 'yyyy-mm-dd');
    }

    this.currentFromDate = this.formatDate(startDate, 'yyyy-mm-dd');
    this.currentToDate = this.formatDate(endDate, 'yyyy-mm-dd');

    this.get_all_transactions(
      this.selectedEmployeeId,
      this.currentFromDate,
      this.currentToDate
    );
  }

  formatDate(date: Date | string, format: string = 'yyyy-mm-dd'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      console.error('تاريخ غير صالح:', date);
      return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    switch (format.toLowerCase()) {
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`;
      case 'dd-mm-yyyy':
        return `${day}-${month}-${year}`;
      case 'mm/dd/yyyy':
        return `${month}/${day}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  openCustomDatePicker() {
    Swal.fire({
      title: 'اختر الفترة المخصصة',
      html: `
    <div style="display: flex; flex-direction: column; gap: 12px; text-align: right; font-size: 14px;">
      <div>
        <label style="margin-bottom: 4px; display: block;">📅 من:</label>
        <input type="date" value="${this.searchDate.split(' - ')[0]}" id="startDate" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; width: 100%; font-size: 14px;" />
      </div>
      <div>
        <label style="margin-bottom: 4px; display: block;">📅 إلى:</label>
        <input type="date" value="${this.searchDate.split(' - ')[1]}" id="endDate" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; width: 100%; font-size: 14px;" />
      </div>
    </div>
      `,
      customClass: {
        popup: 'custom-popup-class'
      },
      confirmButtonText: 'تأكيد',
      showCancelButton: true,
      cancelButtonText: 'إلغاء',
      focusConfirm: false,
      preConfirm: () => {
        const start = (document.getElementById('startDate') as HTMLInputElement)?.value;
        const end = (document.getElementById('endDate') as HTMLInputElement)?.value;

        if (!start || !end) {
          Swal.showValidationMessage('يرجى اختيار كلا التاريخين');
          return false;
        }

        if (new Date(start) > new Date(end)) {
          Swal.showValidationMessage('تاريخ البداية لا يمكن أن يكون بعد النهاية');
          return false;
        }

        return { startDate: start, endDate: end };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { startDate, endDate } = result.value;
        console.log('📆 التاريخ من:', startDate, 'إلى:', endDate);

        // هنا خزّنهم في متغيراتك، مثلاً:
        if (this.formatDate(startDate, 'yyyy-mm-dd') == this.formatDate(endDate, 'yyyy-mm-dd')) {
          this.searchDate = this.formatDate(startDate, 'yyyy-mm-dd');
        } else {
          this.searchDate = this.formatDate(startDate, 'yyyy-mm-dd') + ' - ' + this.formatDate(endDate, 'yyyy-mm-dd');
        }

        // ولو محتاج تعيد تحميل بيانات أو فلترة:
        this.currentFromDate = startDate;
        this.currentToDate = endDate;
        this.get_all_transactions(this.selectedEmployeeId, startDate, endDate);
        this.selectedRange = 'custom';

      }
    });
  }

  getAllEmployees() {
    this.adminService.get_all_admins().subscribe({
      next: (res: any) => {
        const admins: Iemployee[] = res.ok && res.data.length > 0 ? res.data : [];
        this.emp_service.get_all_employees().subscribe({
          next: (res2: any) => {
            const employees: Iemployee[] = res2.ok && res2.data.length > 0 ? res2.data : [];
            this.all_employees = [...admins, ...employees];

            if (this.selectedEmployeeId) {
              const found = this.all_employees.find(e => e.id === this.selectedEmployeeId);
              if (found) {
                this.user_name = found.fullName;
              }
            }
          },
          error: (error: any) => {
            console.error('Error fetching employees:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('Error fetching admins:', error);
      }
    });
  }

  onEmployeeChange() {
    if (this.selectedEmployeeId) {
      const found = this.all_employees.find(e => e.id === this.selectedEmployeeId);
      this.user_name = found?.fullName || this.user_name;
    } else {
      this.user_name = '';
    }

    if (this.currentFromDate && this.currentToDate) {
      this.get_all_transactions(this.selectedEmployeeId, this.currentFromDate, this.currentToDate);
    } else {
      this.updateDateRange();
    }
  }

  getEmployeeName(employeeId: string | null | undefined): string {
    if (!employeeId) {
      return '-';
    }
    const emp = this.all_employees.find(e => e.id === employeeId);
    return emp?.fullName || '-';
  }

  /**
   * تنسيق المبالغ المالية
   * @param amount المبلغ المالي
   * @returns سلسلة نصية مع تنسيق العملة
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * الحصول على تفاصيل طريقة الدفع
   * @param method رقم طريقة الدفع
   * @returns كائن يحتوي على تفاصيل طريقة الدفع
   */
  getPaymentMethodDetails(method: number): PaymentMethod {
    const methods: { [key: number]: PaymentMethod } = {
      1: { name: "كاش", icon: "fa-money-bill-wave", color: "green" },
      2: { name: "تحويل", icon: "fa-credit-card", color: "blue" },
      3: { name: "شبكة", icon: "fa-university", color: "purple" },
      4: { name: "خصم", icon: "fa-mobile-alt", color: "yellow" }
    };
    return methods[method] || { name: "غير معروف", icon: "fa-question-circle", color: "gray" };
  }

  /**
   * تصفية المعاملات بناءً على البحث والفلاتر
   */
  filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesSearch = transaction.reservationInvoiceNumber
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesSource = this.sourceFilter === 'all' ||
        transaction.source === this.sourceFilter;

      const matchesPayment = this.paymentFilter === 0 ||
        transaction.paymentMethod === this.paymentFilter;

      return matchesSearch && matchesSource && matchesPayment;
    });

    // حساب المجاميع بناءً على البيانات المصفاة
    this.calculateFilteredTotals();
  }


  calculateFilteredTotals(): void {
    // this.TotalInvoices = this.filteredTransactions.reduce((total, transaction) =>
    //   total + transaction.totalInvoice, 0);

    // this.TotalPaid = this.filteredTransactions.reduce((total, transaction) =>
    //   total + transaction.paidAmount, 0);

    // this.Remaining = this.filteredTransactions.reduce((total, transaction) =>
    //   total + transaction.remainingMoney, 0);

    // this.Transactions = this.filteredTransactions.length;

    // فقط الفواتير (Initial Payment)
    // const invoiceTransactions = this.filteredTransactions.filter(
    //   transaction => transaction.source === ''
    // );

    // المجموع من الفواتير فقط
    this.TotalInvoices = this.transactions.reduce(
      (total, transaction) => total + transaction.totalInvoice,
      0
    );

    this.Remaining = this.transactions.reduce(
      (total, transaction) => total + transaction.remainingMoney,
      0
    );

    // المدفوعات من كل المعاملات
    this.TotalPaid = this.filteredTransactions.reduce(
      (total, transaction) => total + transaction.paidAmount,
      0
    );

    // عدد المعاملات بعد الفلترة (ممكن تخليه عدد الفواتير فقط لو حبيت)
    this.Transactions = this.filteredTransactions.length;


  }

  /**
   * التحقق من اكتمال الدفع
   * @param transaction المعاملة المالية
   * @returns true إذا كان الدفع مكتملاً
   */
  isPaidInFull(transaction: Itransaction): boolean {
    return transaction.remainingMoney === 0;
  }

  /**
   * الحصول على فئة CSS لحالة الدفع
   * @param transaction المعاملة المالية
   * @returns سلسلة نصية تحتوي على فئات CSS
   */
  getPaymentStatusClass(transaction: Itransaction): string {
    return this.isPaidInFull(transaction) ?
      'text-green-600 font-medium' : 'text-gray-500';
  }

  /**
   * الحصول على فئة CSS لحالة الرصيد المتبقي
   * @param transaction المعاملة المالية
   * @returns سلسلة نصية تحتوي على فئات CSS
   */
  getRemainingBalanceClass(transaction: Itransaction): string {
    return transaction.remainingMoney > 0 ?
      'text-red-600 font-medium' : 'text-gray-500';
  }

  /**
   * الحصول على فئة CSS لنوع المصدر
   * @param source نوع المصدر
   * @returns سلسلة نصية تحتوي على فئات CSS
   */
  getSourceClass(source: string): string {
    return source === 'Initial Payment' ?
      'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  }

  /**
   * الحصول على أيقونة المصدر
   * @param source نوع المصدر
   * @returns سلسلة نصية تحتوي على اسم الأيقونة
   */
  getSourceIcon(source: string): string {
    return source === 'Initial Payment' ?
      'fa-file-invoice-dollar' : 'fa-redo-alt';
  }



  pamentEnum: { [key: number]: string } = {
    1: "كاش",
    3: "تحويل",
    2: "شبكة",
    4: "خصم",
  };





  // async exportDataToExcelStyled() {
  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet('تقرير المعاملات');

  //   // 🟦 الترويسة - صف المعلومات الأساسية
  //   const infoRow = sheet.addRow([
  //     'اسم الموظف:', this.user_name || '-',
  //     'الفترة:', this.searchDate || '-',
  //     'طريقة الدفع:', this.pamentEnum[this.paymentFilter] || 'الكل',
  //     'المصدر:', this.sourceFilter === 'all' ? 'الكل' :
  //       this.sourceFilter === 'Initial Payment' ? 'فاتورة حجز' : 'سداد دفعة'
  //   ]);

  //   infoRow.font = { bold: true, size: 13 };
  //   infoRow.eachCell(cell => {
  //     cell.alignment = { horizontal: 'right' };
  //   });

  //   // 🟦 الترويسة - صف الإجماليات
  //   const totalsRow = sheet.addRow([
  //     'إجمالي الإيرادات:', this.TotalInvoices,
  //     'إجمالي المدفوعات:', this.TotalPaid,
  //     'المتبقي:', this.Remaining,
  //     'عدد العمليات:', this.Transactions
  //   ]);

  //   totalsRow.font = { bold: true };
  //   totalsRow.eachCell(cell => {
  //     cell.alignment = { horizontal: 'right' };
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: 'FFEFFFEF' }
  //     };
  //     cell.border = {
  //       top: { style: 'thin' },
  //       bottom: { style: 'thin' },
  //       left: { style: 'thin' },
  //       right: { style: 'thin' }
  //     };
  //   });

  //   // صف فاصل
  //   sheet.addRow([]);

  //   // 🟨 البيانات
  //   const exportData = this.filteredTransactions.map((t) => ({
  //     'رقم الفاتورة': t.reservationInvoiceNumber,
  //     'المصدر': t.source === 'Initial Payment' ? 'فاتورة حجز' : 'سداد دفعة',
  //     'إجمالي الإيرادات': t.source === 'Initial Payment' ? t.totalInvoice : '-',
  //     'المدفوع': t.paidAmount,
  //     'المتبقي': t.source === 'Initial Payment' ? t.remainingMoney : '-',
  //     'طريقة الدفع': this.pamentEnum[t.paymentMethod] || 'غير معروف',
  //     'التاريخ': this.datePipe.transform(t.date, 'yyyy-MM-dd - hh:mm a', '', 'ar-EG')
  //   }));

  //   const headers = Object.keys(exportData[0]);
  //   sheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));

  //   // 🟨 إضافة البيانات + تنسيق
  //   exportData.forEach(rowData => {
  //     const row = sheet.addRow(rowData);
  //     row.eachCell(cell => {
  //       cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  //       cell.border = {
  //         top: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         left: { style: 'thin' },
  //         right: { style: 'thin' }
  //       };
  //     });
  //   });

  //   // 🟥 تلوين المتبقي > 0
  //   const remainingColIndex = headers.indexOf('المتبقي') + 1;
  //   sheet.eachRow((row, idx) => {
  //     if (idx <= 3) return; // تخطي الترويسة
  //     const cell = row.getCell(remainingColIndex);
  //     if (!isNaN(Number(cell.value)) && Number(cell.value) > 0) {
  //       cell.fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: 'FFFFE5E5' }
  //       };
  //     }
  //   });

  //   // ✅ حفظ الملف
  //   const { value: fileName } = await Swal.fire({
  //     title: 'أدخل اسم ملف الاكسيل',
  //     input: 'text',
  //     inputValue: `تقرير-المعاملات-${new Date().toISOString().split('T')[0]}`,
  //     inputPlaceholder: 'مثال: تقرير الحجوزات',
  //     confirmButtonText: 'تحميل',
  //     confirmButtonColor: '#B50D0D',
  //     cancelButtonText: 'إلغاء',
  //     showCancelButton: true,
  //     inputValidator: (value) => {
  //       if (!value) return 'يجب كتابة اسم الملف!';
  //       return null;
  //     }
  //   });

  //   if (fileName) {
  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //     });
  //     FileSaver.saveAs(blob, `${fileName.trim()}.xlsx`);
  //   }
  // }

  // async exportTransactionsToExcel() {
  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet('تقرير الصندوق');

  //   // 🟢 إعداد الترويسة
  //   const headerTitles = ['اسم الموظف', 'الفترة', 'طريقة الدفع', 'نوع العملية'];
  //   const headerValues = [
  //     this.user_name || '—',
  //     this.searchDate || '—',
  //     this.paymentFilter === 0 ? 'الكل' : this.getPaymentMethodDetails(this.paymentFilter).name,
  //     this.sourceFilter === 'all' ? 'الكل' :
  //       this.sourceFilter === 'Initial Payment' ? 'فاتورة حجز' : 'سداد دفعة'
  //   ];

  //   sheet.addRow(headerTitles);
  //   sheet.addRow(headerValues);

  //   // 🟢 إعداد صف الإجماليات
  //   sheet.addRow([]);
  //   sheet.addRow(['إجمالي الإيرادات', 'إجمالي المدفوعات', 'المتبقي', 'عدد العمليات']);
  //   sheet.addRow([
  //     this.TotalInvoices,
  //     this.TotalPaid,
  //     this.Remaining,
  //     this.Transactions
  //   ]);

  //   sheet.addRow([]); // سطر فارغ للفصل

  //   // 🟢 إعداد رأس الجدول الرئيسي
  //   const tableHeaders = [
  //     'رقم الفاتورة',
  //     'المصدر',
  //     'المبلغ',
  //     'المدفوع',
  //     'المتبقي',
  //     'طريقة الدفع',
  //     'التاريخ'
  //   ];
  //   sheet.addRow(tableHeaders);

  //   // 🟢 إعداد البيانات
  //   this.filteredTransactions.forEach(tran => {
  //     const isInvoice = tran.source === 'Initial Payment';
  //     sheet.addRow([
  //       tran.reservationInvoiceNumber,
  //       isInvoice ? 'فاتورة حجز' : 'سداد دفعة',
  //       isInvoice ? tran.totalInvoice : '-',
  //       tran.paidAmount,
  //       isInvoice ? tran.remainingMoney : '-',
  //       this.getPaymentMethodDetails(tran.paymentMethod).name,
  //       this.datePipe.transform(tran.date, 'yyyy-MM-dd - hh:mm a', '', 'ar-EG') || ''
  //     ]);
  //   });

  //   // 🟢 توسيع الأعمدة وتنسيقها
  //   const colWidths = [20, 20, 15, 15, 15, 20, 30];
  //   sheet.columns.forEach((col, i) => {
  //     col.width = colWidths[i] || 20;
  //   });

  //   sheet.eachRow((row, rowIndex) => {
  //     row.eachCell(cell => {
  //       cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  //       cell.border = {
  //         top: { style: 'thin' },
  //         bottom: { style: 'thin' },
  //         left: { style: 'thin' },
  //         right: { style: 'thin' }
  //       };
  //       if (rowIndex <= 2 || rowIndex === 4 || rowIndex === 5) {
  //         cell.font = { bold: true };
  //       }
  //     });
  //   });

  //   // 🟥 تلوين خانة "المتبقي" لو > 0
  //   const remainingColIndex = 5; // عمود "المتبقي"
  //   const dataStartRow = 7 + 1; // بعد الهيدر
  //   for (let i = dataStartRow; i < sheet.rowCount + 1; i++) {
  //     const row = sheet.getRow(i);
  //     const cell = row.getCell(remainingColIndex);
  //     const val = cell.value;
  //     if (typeof val === 'number' && val > 0) {
  //       cell.fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: 'FFFFE5E5' }
  //       };
  //     }
  //   }

  //   // 🟢 Swal لاسم الملف
  //   const { value: fileName } = await Swal.fire({
  //     title: 'أدخل اسم الملف',
  //     input: 'text',
  //     inputValue: `تقرير-الصندوق-${new Date().toISOString().split('T')[0]}`,
  //     confirmButtonText: 'تحميل',
  //     cancelButtonText: 'إلغاء',
  //     showCancelButton: true,
  //     inputValidator: value => value ? null : 'يجب إدخال اسم للملف'
  //   });

  //   if (fileName) {
  //     const buffer = await workbook.xlsx.writeBuffer();
  //     const blob = new Blob([buffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //     });
  //     FileSaver.saveAs(blob, `${fileName.trim()}.xlsx`);
  //   }
  // }


  async exportTransactionsToExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير الصندوق');

    const startCol = 3; // يعني من العمود C

    // الترويسة: عناوين
    const headerTitles = ['اسم الموظف', 'الفترة', 'طريقة الدفع', 'نوع العملية'];
    const headerValues = [
      this.user_name || '—',
      this.searchDate || '—',
      this.paymentFilter === 0 ? 'الكل' : this.getPaymentMethodDetails(this.paymentFilter).name,
      this.sourceFilter === 'all' ? 'الكل' :
        this.sourceFilter === 'Initial Payment' ? 'فاتورة حجز' : 'سداد دفعة'
    ];

    // صف 1: عناوين الترويسة
    const row1 = sheet.getRow(1);
    headerTitles.reverse().forEach((text, i) => {
      const cell = row1.getCell(startCol + i);
      cell.value = text;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDCE6F1' }
      };
      cell.font = { bold: true, size: 14 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row1.height = 40;

    // صف 2: محتوى الترويسة
    const row2 = sheet.getRow(2);
    headerValues.reverse().forEach((text, i) => {
      const cell = row2.getCell(startCol + i );//======================???
      cell.value = text;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF3FB' }
      };
      cell.font = { size: 14 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row2.height = 40;
    row2.getCell(startCol + 2).font = { size: 11 };

    sheet.addRow([]);

    // صف الإجماليات
    const summaryTitles = ['إجمالي المدفوعات', 'عدد العمليات'];
    const summaryValues = [ this.TotalPaid, this.Transactions];

    const row4 = sheet.getRow(4);
    summaryTitles.reverse().forEach((text, i) => {
      const cell = row4.getCell(startCol + i + 2);
      cell.value = text;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDCE6F1' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row4.height = 40;

    const row5 = sheet.getRow(5);
    summaryValues.reverse().forEach((text, i) => {
      const cell = row5.getCell(startCol + i + 2);
      cell.value = text;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF3FB' }
      };
      cell.font = { bold: false };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row5.height = 40;

    sheet.addRow([]);

    // هيدر الجدول
    const tableHeaders = [
      'رقم الفاتورة',
      'الموظف',
      'تاريخ العملية',
      'المصدر',
      'المبلغ المدفوع',
      'طريقة الدفع',

    ].reverse();

    const headerRowNumber = sheet.lastRow!.number + 1; // يضيف بعد آخر صف
    const headerRow = sheet.getRow(headerRowNumber);

    tableHeaders.forEach((text, i) => {
      const cell = headerRow.getCell(2 + i); // يبدأ من B
      cell.value = text;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB7CCE1' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headerRow.commit();

    // البيانات
    this.filteredTransactions.forEach((tran: Itransaction) => {
      const isInvoice = tran.source === 'Initial Payment';
      const dataRowNumber = sheet.lastRow!.number + 1; // بعد آخر صف
      const row = sheet.getRow(dataRowNumber);

      const rowData = [
        tran.reservationInvoiceNumber,
        this.getEmployeeName(tran.employeeId),
        this.datePipe.transform(tran.date, 'yyyy-MM-dd - hh:mm a', '', 'ar-EG') || '',
        isInvoice ? 'فاتورة حجز' : 'سداد دفعة',
        tran.paidAmount,
        this.getPaymentMethodDetails(tran.paymentMethod).name,
      ].reverse();

      rowData.forEach((val: any, i: number) => {
        const cell = row.getCell(2 + i); // يبدأ من العمود B
        cell.value = val;
        cell.font = { size: 12 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7FAFC' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      row.commit();
    });

    // توسيع الأعمدة
    const colWidths = [30, 30, 30, 30, 30, 30, 30].reverse();
    sheet.columns.forEach((col: any, i: number) => {
      col.width = colWidths[i] || 20;
    });

    // تلوين المتبقي لو أكبر من 0
    const remainingColIndex = 3;
    const firstDataRow = sheet.actualRowCount - this.filteredTransactions.length + 1;
    for (let i = firstDataRow; i <= sheet.rowCount; i++) {
      const cell = sheet.getRow(i).getCell(remainingColIndex);
      const val = cell.value;
      if (typeof val === 'number' && val > 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE5E5' }
        };
      }
    }

    // حفظ الملف
    const { value: fileName } = await Swal.fire({
      title: 'أدخل اسم الملف',
      input: 'text',
      inputValue: `تقرير-الصندوق - ${new Date().toLocaleDateString('en-CA')}`,
      confirmButtonText: 'تحميل',
      cancelButtonText: 'إلغاء',
      showCancelButton: true,
      inputValidator: value => value ? null : 'يجب إدخال اسم للملف'
    });

    if (fileName) {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      FileSaver.saveAs(blob, `${fileName.trim()}.xlsx`);
    }
  }


}