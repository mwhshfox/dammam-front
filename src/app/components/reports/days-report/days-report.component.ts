
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Itrip } from '../../../core/models/itrip';
import { TripsService } from '../../../core/services/trips.service';
import { ReportsService } from '../../../core/services/reports.service';
import { saveAs } from 'file-saver';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IreportData } from '../../../core/models/ireport-data';
import { IavailableReportData } from '../../../core/models/ireport-data';


@Component({
  selector: 'app-days-report',
  standalone: true,
  imports: [EnumPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './days-report.component.html',
  styleUrl: './days-report.component.scss'
})
export class DaysReportComponent {



  private readonly trip_service = inject(TripsService);
  private readonly reports_Service = inject(ReportsService);
  private readonly router = inject(Router);
  private readonly act_route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);


  private currentID: string = ''
  current_name: string = ''
  report_type: string = ''
  report_name: string = ''
  search_value: string = '';
  report_data: IreportData[] = [];
  available_report_data: IavailableReportData[] = [];
  reserved_rooms_report_data: {
    hotelName: string;
    hotelAddress: string;
    residenceFrom: string;
    residenceTo: string;
    roomType: number;
    roomsCount: number;
    bedPrice: number;
    roomPrice: number;
  }[] = [];

  reserved_rooms_summary: {
    hotelName: string;
    hotelAddress: string;
    totalRooms: number;
    roomsByType: { roomType: number; roomsCount: number }[];
  }[] = [];

  totalCustomers: number = 0;
  totalmotabaky_money: number = 0;

  search_code: string | null = null;
  search_date: string | null = null;
  search_departureTime: string | null = null;
  search_startDate: string | null = null;
  search_endDate: string | null = null;

  saving_Actions: 'print' | 'download' | 'view' = 'print';
  all_trips: Itrip[] = []
  table_head_titles: string[] = [
    '#',
    'كود الرحلة',
    ' الوجهة',
    'تاريخ',
    'اماكن متاحة',
  ]

  ngOnInit(): void {
    // this.get_all_trips()
    this.trip_service.current_stage.next('all')
    this.get_report_type()
    // this.init_search()
  }

  get_reserved_rooms_report() {
    const startDate = this.trip_search_form.get('startDate')?.value
    const endDate = this.trip_search_form.get('endDate')?.value

    if (startDate && endDate) {
      this.search_startDate = startDate
      this.search_endDate = endDate

      this.reports_Service.get_reserved_rooms_report(startDate, endDate).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.reserved_rooms_report_data = (res.data || []).slice().sort((a: any, b: any) => {
              const at = new Date(a?.residenceFrom).getTime();
              const bt = new Date(b?.residenceFrom).getTime();
              return (isNaN(at) ? 0 : at) - (isNaN(bt) ? 0 : bt);
            });
            this.reserved_rooms_summary = this.buildReservedRoomsSummary(this.reserved_rooms_report_data);
          }
        },
        error: (err: any) => {
          console.log(err.status);
        }
      })
    }
    else {
      this.reserved_rooms_report_data = []
      this.reserved_rooms_summary = []
      Swal.fire("تنبيه", "يجب إدخال تاريخ البداية و النهاية", "warning");
    }
  }

  buildReservedRoomsSummary(data: { hotelName: string; hotelAddress: string; roomType: number; roomsCount: number }[]) {
    const map = new Map<string, { hotelName: string; hotelAddress: string; roomTypeTotals: Map<number, number> }>();

    data.forEach((item) => {
      const key = `${item.hotelName}__${item.hotelAddress}`;
      if (!map.has(key)) {
        map.set(key, {
          hotelName: item.hotelName,
          hotelAddress: item.hotelAddress,
          roomTypeTotals: new Map<number, number>()
        });
      }

      const record = map.get(key)!;
      record.roomTypeTotals.set(item.roomType, (record.roomTypeTotals.get(item.roomType) || 0) + (item.roomsCount || 0));
    });

    return Array.from(map.values()).map((v) => ({
      hotelName: v.hotelName,
      hotelAddress: v.hotelAddress,
      totalRooms: Array.from(v.roomTypeTotals.values()).reduce((sum, n) => sum + (n || 0), 0),
      roomsByType: Array.from(v.roomTypeTotals.entries())
        .map(([roomType, roomsCount]) => ({ roomType, roomsCount }))
        .sort((a, b) => a.roomType - b.roomType)
    }));
  }

  get_report_type() {
    this.report_type = this.act_route.snapshot.params['report_type']

    if (this.report_type == 'departure') {
      this.report_name = 'تقرير الذهاب ليوم معين'
    }
    else if (this.report_type == 'return') {
      this.report_name = 'تقرير العودات ليوم معين'
    }

    else if (this.report_type == 'available') {
      this.report_name = 'تقرير اجمالي المتاح ليوم معين'
    }

    else if (this.report_type == 'motabaky') {
      this.report_name = 'تقرير المتبقي'
    }

    else if (this.report_type == 'reserved-rooms') {
      this.report_name = 'تقرير غرف الفندق'
    }

  }

  trip_search_form = this.fb.group({
    date: ['', Validators.required],
    tripCode: ['', Validators.required],
    departureTime: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  })

  get_report() {
    if (this.report_type == 'departure' || this.report_type == 'return' || this.report_type == 'motabaky') {
      // this.search_code = this.trip_search_form.get('tripCode')?.value!
      // this.search_departureTime = this.trip_search_form.get('departureTime')?.value!
      this.report_data = []
      this.available_report_data = []
      this.reserved_rooms_report_data = []
      this.reserved_rooms_summary = []
      this.search_code = null
      this.search_date = null
      this.search_departureTime = null
      this.search_startDate = null
      this.search_endDate = null
      this.report_type == 'motabaky' ? this.get_motabaky_report() : ''
      this.report_type == 'departure' || this.report_type == 'return' ? this.get_days_report() : ''
    }
    else if (this.report_type == 'available') {
      this.report_data = []
      this.available_report_data = []
      this.reserved_rooms_report_data = []
      this.reserved_rooms_summary = []
      this.search_code = null
      this.search_date = null
      this.search_departureTime = null
      this.search_startDate = null
      this.search_endDate = null
      this.get_available_report()
    }
    else if (this.report_type == 'reserved-rooms') {
      this.report_data = []
      this.available_report_data = []
      this.reserved_rooms_report_data = []
      this.reserved_rooms_summary = []
      this.search_code = null
      this.search_date = null
      this.search_departureTime = null
      this.search_startDate = null
      this.search_endDate = null
      this.get_reserved_rooms_report()
    }
  }

  get_motabaky_report() {
    let code = this.trip_search_form.get('tripCode')?.value
    let date = this.trip_search_form.get('date')?.value
    if (date) {
      this.search_code = code || null
      this.search_date = date
      console.log("code", code);
      this.reports_Service.export_motabaky_Report(date!, code ? code : null).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.report_data = res.data
            this.totalmotabaky_money = this.getTotalmotabaky(this.report_data);
          }
          console.log(res);
        },
        error: (err) => {
          console.log(err.status);
        }
      })
    }
    else {
      this.report_data = []
      Swal.fire("تنبيه", " يجب إدخال تاريخ البحث", "warning");
    }
  }


  get_days_report() {
    let code = this.trip_search_form.get('tripCode')?.value
    let date = this.trip_search_form.get('date')?.value
    if (date) {
      this.search_code = code || null
      this.search_date = date
      console.log("code", code);
      this.reports_Service.get_data_daysReport(date!, code ? code : null, this.report_type).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.report_data = res.data
            this.report_data.map((item: IreportData) => {
              item.maleCount = this.getMaleCount(item)
              item.femaleCount = this.getFemaleCount(item)
            })
            this.totalCustomers = this.getTotalCustomers(this.report_data);
          }
          console.log(res);
        },
        error: (err) => {
          console.log(err.status);
        }
      })
    }
    else {
      this.report_data = []
      Swal.fire("تنبيه", " يجب إدخال تاريخ البحث", "warning");
    }
  }


  get_available_report() {
    let date = this.trip_search_form.get('departureTime')?.value
    if (date) {
      this.search_departureTime = date
      console.log("date", date);
      this.reports_Service.get_data_AvailableReport(date).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.available_report_data = res.data
            // this.report_data.map((item: IreportData) => {
            //   item.maleCount = this.getMaleCount(item)
            //   item.femaleCount = this.getFemaleCount(item)
            // })
          }
          console.log(res);
        },
        error: (err) => {
          console.log(err.status);
        }
      })
    }
    else {
      this.available_report_data = []
      Swal.fire("تنبيه", "يجب إدخال التاريخ", "warning");
    }
  }


  getMaleCount(item: IreportData): number {
    console.log('run func');

    return item.reservation.ticket.customersTickets
      .filter(c => c.customer.gender === 1).length;
  }

  getFemaleCount(item: IreportData): number {
    console.log('run func');

    return item.reservation.ticket.customersTickets
      .filter(c => c.customer.gender === 2).length;
  }


  getTotalmotabaky(data: any[]): number {
    return data.reduce((total, item) => {
      const count = item.remainingAmount || 0;
      return total + count;
    }, 0);
  }

  getTotalCustomers(data: any[]): number {
    return data.reduce((total, item) => {
      const count = item.ticketDto?.customersTickets?.length || 0;
      return total + count;
    }, 0);
  }


  download_pdf() {
    if (this.report_type == 'departure' || this.report_type == 'return') {
      this.reports_Service.exportdaysReport(this.search_date!, this.search_code!, this.report_type).subscribe(file => {
        saveAs(file, `${this.report_name}_${this.search_code}.pdf`);
      });
    }
    else if (this.report_type == 'available') {
      this.reports_Service.exportAvailableReport(this.search_departureTime!).subscribe(file => {
        saveAs(file, `${this.report_name}_${this.search_departureTime}.pdf`);
      });
    }
    else if (this.report_type == 'motabaky') {
      this.reports_Service.exportMotabakyReport(this.search_date!, this.search_code!).subscribe(file => {
        saveAs(file, `${this.report_name}_${this.search_code}.pdf`);
      });
    }
  }

  print_pdf() {
    if (!this.search_departureTime && !this.search_date && !this.search_code) {
      Swal.fire("تنبيه", "يجب إدخال جميع البيانات", "warning");
      return;
    }

    if (this.report_type == 'departure' || this.report_type == 'return') {
      this.print_days_report()
    }
    else if (this.report_type == 'available') {
      this.print_available_report()
    }
    else if (this.report_type == 'motabaky') {
      this.print_motabaky_report()
    }
  }



  print_days_report() {
    this.reports_Service.exportdaysReport(this.search_date!, this.search_code!, this.report_type).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          Swal.fire("خطأ", "الملف فارغ ولا يمكن طباعته", "error");
          return;
        }

        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL, '_blank');

        if (!printWindow) {
          Swal.fire("خطأ", "لم يتم فتح نافذة الطباعة (تأكد من عدم حظر النوافذ المنبثقة)", "error");
          return;
        }

        printWindow.onload = () => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (err) {
            console.error("Print error:", err);
            Swal.fire("خطأ", "حدث خطأ أثناء تنفيذ أمر الطباعة", "error");
          }
        };
      },
      error: (err) => {
        console.error('Print failed:', err);
        Swal.fire("خطأ", err.message || "فشل في طباعة الفاتورة", "error");
      }
    });
  }

  print_motabaky_report() {
    this.reports_Service.exportMotabakyReport(this.search_date!, this.search_code!).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          Swal.fire("خطأ", "الملف فارغ ولا يمكن طباعته", "error");
          return;
        }

        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL, '_blank');

        if (!printWindow) {
          Swal.fire("خطأ", "لم يتم فتح نافذة الطباعة (تأكد من عدم حظر النوافذ المنبثقة)", "error");
          return;
        }

        printWindow.onload = () => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (err) {
            console.error("Print error:", err);
            Swal.fire("خطأ", "حدث خطأ أثناء تنفيذ أمر الطباعة", "error");
          }
        };
      },
      error: (err) => {
        console.error('Print failed:', err);
        Swal.fire("خطأ", err.message || "فشل في طباعة الفاتورة", "error");
      }
    });
  }


  print_available_report() {
    this.reports_Service.exportAvailableReport(this.search_departureTime!).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          Swal.fire("خطأ", "الملف فارغ ولا يمكن طباعته", "error");
          return;
        }

        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL, '_blank');

        if (!printWindow) {
          Swal.fire("خطأ", "لم يتم فتح نافذة الطباعة (تأكد من عدم حظر النوافذ المنبثقة)", "error");
          return;
        }

        printWindow.onload = () => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (err) {
            console.error("Print error:", err);
            Swal.fire("خطأ", "حدث خطأ أثناء تنفيذ أمر الطباعة", "error");
          }
        };
      },
      error: (err) => {
        console.error('Print failed:', err);
        Swal.fire("خطأ", err.message || "فشل في طباعة الفاتورة", "error");
      }
    });
  }

  get_all_trips() {
    this.trip_service.get_all_trips().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_trips = res.data
          console.log(this.all_trips);
        }
        console.log(res);
      },
      error: (err) => {
        console.log(err.status);
      }
    })
  }

  save_trip(trip_data: Itrip) {
    this.trip_service.current_trip.next(trip_data)
    console.log(trip_data);
  }



  cancel_search() {
    this.trip_search_form.reset()
    this.search_code = null
    this.search_date = null
    this.search_departureTime = null
    this.search_startDate = null
    this.search_endDate = null
    // this.get_all_trips()
    this.report_data = []
    this.available_report_data = []
    this.reserved_rooms_report_data = []
    this.reserved_rooms_summary = []
  }




  // ################################### تركيب الباص ################################### 
  // ################################### تركيب الباص ################################### 

  save_bus_report_Pdf(tripId: string) {
    this.reports_Service.exportBusTripParticipantsReport(tripId).subscribe(file => {
      saveAs(file, `تركيب الباص _${tripId}.pdf`);
    });
  }


  print_bus_report(tripId: string) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportBusTripParticipantsReport(tripId).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          Swal.fire("خطأ", "الملف فارغ ولا يمكن طباعته", "error");
          return;
        }

        const fileURL = URL.createObjectURL(blob);
        const printWindow = window.open(fileURL, '_blank');

        if (!printWindow) {
          Swal.fire("خطأ", "لم يتم فتح نافذة الطباعة (تأكد من عدم حظر النوافذ المنبثقة)", "error");
          return;
        }

        printWindow.onload = () => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (err) {
            console.error("Print error:", err);
            Swal.fire("خطأ", "حدث خطأ أثناء تنفيذ أمر الطباعة", "error");
          }
        };
      },
      error: (err) => {
        console.error('Print failed:', err);
        Swal.fire("خطأ", err.message || "فشل في طباعة الفاتورة", "error");
      }
    });
  }


  open_bus_report(tripId: string) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportBusTripParticipantsReport(tripId).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) {
          Swal.fire("خطأ", "الملف فارغ ولا يمكن عرضه", "error");
          return;
        }

        const fileURL = URL.createObjectURL(blob);
        const newWindow = window.open(fileURL, '_blank');

        if (!newWindow) {
          Swal.fire("خطأ", "لم يتم فتح الفاتورة (تأكد من عدم حظر النوافذ المنبثقة)", "error");
        }
      },
      error: (err) => {
        console.error('Open invoice failed:', err);
        Swal.fire("خطأ", err.message || "فشل في عرض الفاتورة", "error");
      }
    });
  }


}
