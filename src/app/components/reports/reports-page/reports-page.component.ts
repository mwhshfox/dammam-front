import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ReportsService } from '../../../core/services/reports.service';
import { CurrencyPipe, DatePipe, NgFor } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CurrencyPipe, DatePipe, NgFor],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  private readonly reports_Service = inject(ReportsService);
  private readonly router = inject(Router);
  constructor() { };


  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_current_stage()
    // this.getReservations()
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
    this.reports_Service.getAllReservations().subscribe((data: any) => {
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
