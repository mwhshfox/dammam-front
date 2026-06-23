import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Itrip } from '../../../core/models/itrip';
import { TripsService } from '../../../core/services/trips.service';
import { ReportsService } from '../../../core/services/reports.service';
import { saveAs } from 'file-saver';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-trips-reports',
  standalone: true,
  imports: [EnumPipe, DatePipe, RouterLink],
  templateUrl: './trips-reports.component.html',
  styleUrl: './trips-reports.component.scss'
})
export class TripsReportsComponent {
  private readonly trip_service = inject(TripsService);
  private readonly reports_Service = inject(ReportsService);
  private readonly router = inject(Router);
  private readonly act_route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);


  private currentID: string = ''
  current_name: string = ''
  report_type: string = ''
  report_name: string = ''
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
    this.get_report_type()
    this.get_all_trips()
    this.trip_service.current_stage.next('all')
    // this.init_search()
  }

  get_report_type() {
    this.report_type = this.act_route.snapshot.params['report_type']

    if (this.report_type == 'bus') {
      this.report_name = 'تركيب الباص'
    }
    else if (this.report_type == 'manifest') {
      this.report_name = 'المنافست'
    }

    else if (this.report_type == 'trip') {
      this.report_name = 'كشف الرحلة'
    }

  }

  trip_search_form = this.fb.group({
    search_code: ['', Validators.required],
  })

  // init_search() {
  //   this.trip_search_form.get('search_code')?.valueChanges.subscribe((value) => {
  //     if (value) {
  //       this.get_searched_trips()
  //     }
  //   })
  // }



  get_all_trips() {
    this.trip_service.get_all_trips().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_trips = res.data
          console.log(this.all_trips);
          this.all_trips = this.sortTripsByDateDesc(this.all_trips);
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


  show_delete_alert(trip_name: string, trip_id: string) {
    Swal.fire({
      title: `  ${trip_name}  `,
      text: ` هل ترغب في حذف هذه الرحلة نهائياً ؟ `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      cancelButtonColor: '#b0b0b0',
      confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
      cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
    }).then((result) => {
      if (result.isConfirmed) {
        // this.router.navigate(['trips'])
        this.delete_item(trip_id)
      }
    });
  }


  delete_item(item_ID: string) {
    this.trip_service.delete_trip(item_ID).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.delete_succes_alert()
          this.get_all_trips()
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
      text: `  تم حذف الرحلة بنجاح`,
      icon: 'success',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
    })
  }


  show_cant_edit_alert() {
    Swal.fire({
      title: `غير مسموح `,
      text: `  لا يمكن تعديل هذه الرحلة حالياً `,
      icon: 'error',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
    })
  }


  get_searched_trips() {
    let code = this.trip_search_form.get('search_code')?.value
    if (code) {
      console.log("code", code);
      this.trip_service.search_trip_by_code(code).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.all_trips = res.data
            this.all_trips = this.sortTripsByDateDesc(this.all_trips);
          }
          console.log(res);
        },
        error: (err) => {
          console.log(err.status);
        }
      })
    }
    else {
      this.get_all_trips()
    }
  }

  clear_search() {
    this.trip_search_form.reset()
    this.get_all_trips()
  }



  sortTripsByDateDesc(trips: Itrip[]) {
    return trips.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
  }



  // downloadPdf(tripId: string) {
  //   this.trip_service.exportTripParticipantsToPdf(tripId).subscribe({
  //     next: (blob: Blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'TripParticipantsReport.pdf';
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     },
  //     error: (err) => {
  //       console.error('Download failed:', err);
  //       Swal.fire(
  //         "خطأ", err.message, "error"
  //       )
  //     }
  //   });
  // }


  book_this_trip(tripId: string) {
    console.log(tripId);
    this.router.navigate(['/Add-Reservation', tripId])
  }






  // تحميل كشف الأسماء PDF
  // downloadParticipantsPdf(tripId: string) {
  //   this.reportsService.exportTripParticipantsToPdf(tripId).subscribe(file => {
  //     saveAs(file, `كشف_الأسماء_${tripId}.pdf`);
  //   });
  // }

  // // تحميل كشف الأسماء PDF
  // downloadParticipantsPdf(tripId: string, trip_type: number | null) {
  //   this.reports_Service.exportTripParticipantsToPdf(tripId, trip_type ? trip_type : null).subscribe(file => {
  //     saveAs(file, `كشف الرحلة _${tripId}.pdf`);
  //   });
  // }

  // تحميل المنافست Excel
  downloadManifestExcel(tripId: string , trip_type: number | null) {
    this.reports_Service.exportTripParticipantsByTripId(tripId, trip_type ? trip_type : null).subscribe(file => {
      saveAs(file, `المنافست_${tripId}.pdf`);
    });
  }

  // تحميل تقرير تركيب الباص (Excel)
  downloadBusSetupReport(tripId: string) {
    this.reports_Service.exportBusTripParticipantsReport(tripId).subscribe(file => {
      saveAs(file, `تركيب_الباص_${tripId}.pdf`);
    });
  }

  tripIdForPdf: string = '';
  showTripTypeModal = false;
  haveTransitCity: boolean = false;
  // فتح المودال مع تمرير tripId
  openTripTypeModal(tripId: string, haveTransitCity: boolean, action: 'print' | 'download' | 'view') {
    this.tripIdForPdf = tripId;
    this.haveTransitCity = haveTransitCity;
    this.showTripTypeModal = true;
    this.saving_Actions = action;
  }

  // اختيار نوع التقرير وتنفيذ التنزيل
  selectTripType(tripType: number | null) {
    if (this.saving_Actions == 'print') {
      this.report_type == 'trip' ? this.print_trip_report(this.tripIdForPdf, tripType) : this.print_manifest_report(this.tripIdForPdf , tripType);
    }
    else if (this.saving_Actions == 'download') {
      this.report_type == 'trip' ? this.save_trip_report_Pdf(this.tripIdForPdf, tripType) : this.save_manifest_report_Pdf(this.tripIdForPdf , tripType);

    } else if (this.saving_Actions == 'view') {
      this.report_type == 'trip' ? this.open_trip_report(this.tripIdForPdf, tripType) : this.open_manifest_report(this.tripIdForPdf , tripType);

    }
    this.showTripTypeModal = false;
  }

  // غلق المودال يدويًا
  closeTripTypeModal() {
    this.showTripTypeModal = false;
  }

  // نفس الفنكشن اللي عندك
  // downloadParticipantsPdf(tripId: string, trip_type: number | null) {
  //   this.reportsService.exportTripParticipantsToPdf(tripId, trip_type).subscribe(file => {
  //     saveAs(file, `كشف_الأسماء_${tripId}.pdf`);
  //   });
  // }







  // ################################### كشف الرحلة ################################### 
  // ################################### كشف الرحلة ################################### 

  // // تحميل كشف الأسماء PDF
  save_trip_report_Pdf(tripId: string, trip_type: number | null) {
    this.reports_Service.exportTripParticipantsToPdf(tripId, trip_type ? trip_type : null).subscribe(file => {
      saveAs(file, `كشف الرحلة _${tripId}.pdf`);
    });
  }


  print_trip_report(tripId: string | null, trip_type: number | null) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportTripParticipantsToPdf(tripId, trip_type ? trip_type : null).subscribe({
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


  open_trip_report(tripId: string | null, trip_type: number | null) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportTripParticipantsToPdf(tripId, trip_type ? trip_type : null).subscribe({
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





  // ################################### المنافست ################################### 
  // ################################### المنافست ################################### 
  save_manifest_report_Pdf(tripId: string , trip_type: number | null) {
    this.reports_Service.exportTripParticipantsByTripId(tripId, trip_type).subscribe(file => {
      saveAs(file, `تركيب الباص _${tripId}.pdf`);
    });
  }


  print_manifest_report(tripId: string , trip_type: number | null) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportTripParticipantsByTripId(tripId, trip_type).subscribe({
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


  open_manifest_report(tripId: string , trip_type: number | null) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportTripParticipantsByTripId(tripId, trip_type).subscribe({
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
