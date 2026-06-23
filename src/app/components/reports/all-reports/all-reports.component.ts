import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { ReportsService } from '../../../core/services/reports.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CurrencyPipe, DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-all-reports',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, NgFor],
  providers: [DatePipe],
  templateUrl: './all-reports.component.html',
  styleUrl: './all-reports.component.scss'
})
export class AllReportsComponent {
  private readonly reports_Service = inject(ReportsService);
  private readonly router = inject(Router);
  constructor(private readonly datePipe: DatePipe) { }


  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_current_stage()
    this.getReservations()
  }


  get_current_stage() {
    this.reports_Service.current_stage.subscribe((value: any) => {
      setTimeout(() => {
        this.current_stage = value
        console.log(value);

      }, 0);
    })

    this.updateDateTime();
    this.intervalId = setInterval(() => this.updateDateTime(), 60000);

    // يمكن استبدال القيم التالية بقيم من API لاحقًا
    this.issued_invoices = 120;
    this.paid_invoices = 90;
    this.unpaid_invoices = 30;
    this.today_reports = 4;
  }


  today_date: string = '';
  today_time: string = '';

  fromDate_search: string = '';
  toDate_search: string = '';

  issued_invoices = 0;
  paid_invoices = 0;
  unpaid_invoices = 0;
  today_reports = 0;

  latest_invoices: any[] = [];


  private intervalId: any;


  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  updateDateTime(): void {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    this.today_date = `${day}/${month}/${year}`;
    this.today_time = `${hours}:${minutes}`;
  }

  getReservations() {

    let startDate = new Date();
    const endDate = new Date();

    endDate.setDate(endDate.getDate());
    startDate.setDate(startDate.getDate() - 2);


    this.fromDate_search = this.datePipe.transform(startDate, 'yyyy-MM-dd') || '';
    this.toDate_search = this.datePipe.transform(endDate, 'yyyy-MM-dd') || '';



    this.reports_Service.get_last_reservations(this.fromDate_search, this.toDate_search).subscribe((data: any) => {
      this.latest_invoices = data?.data?.slice(0, 5); // عرض أول 5 فقط
    });
  }

  getRemaining(res: any): number {
    return res.total - res.paid;
  }


  downloadPdf(tripId: string) {
    this.reports_Service.exportInvoiceReport(tripId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'InvoiceReport.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed:', err);
        Swal.fire(
          "خطأ", err.message, "error"
        )
      }
    });
  }


  printPdf(tripId: string) {
    this.reports_Service.exportInvoiceReport(tripId).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL, '_blank');
        if (printWindow) {
          // ننتظر شوية لحد ما يتم تحميل الملف ثم نطبع
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        } else {
          Swal.fire("خطأ", "لم يتم فتح نافذة الطباعة", "error");
        }
      },
      error: (err) => {
        console.error('Print failed:', err);
        Swal.fire("خطأ", err.message, "error");
      }
    });
  }

  openInvoice(tripId: string) {
    this.reports_Service.exportInvoiceReport(tripId).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL, '_blank');
        if (printWindow) {
          // ننتظر شوية لحد ما يتم تحميل الملف ثم نطبع
        } else {
          Swal.fire("خطأ", "لم يتم عرض الفاتورة", "error");
        }
      },
      error: (err) => {
        console.error('Print failed:', err);
        Swal.fire("خطأ", err.message, "error");
      }
    });
  }

}
