import { Component, inject } from '@angular/core';
import { TripsService } from '../../../core/services/trips.service';
import { Itrip } from '../../../core/models/itrip';
import { DatePipe } from '@angular/common';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-trips',
  standalone: true,
  imports: [EnumPipe, DatePipe, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './all-trips.component.html',
  styleUrl: './all-trips.component.scss'
})
export class AllTripsComponent {
  private readonly trip_service = inject(TripsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  constructor(private readonly datePipe: DatePipe) { }

  private currentID: string = ''
  current_name: string = ''

  search_mode: 'createdOn' | 'fromdate' = 'createdOn';
  search_value: string = '';

  fromDate_search: string = '';
  toDate_search: string = '';


  all_trips: Itrip[] = []
  table_head_titles: string[] = [
    '#',
    'كود الرحلة',
    'تاريخ الاضافة',
    ' الوجهة',
    'تاريخ',
    'اماكن متاحة',
  ]

  ngOnInit(): void {
    this.initForm()
    this.get_all_search_trips()
    this.trip_service.current_stage.next('all')
    // this.init_search()
  }

  trip_search_form!: FormGroup;

  initForm() {
    this.trip_search_form = this.fb.group({
      search_code: [''],
      fromDate: [''],
      toDate: [''],
    })
  }

  // init_search() {
  //   this.trip_search_form.get('search_code')?.valueChanges.subscribe((value) => {
  //     if (value) {
  //       this.get_searched_trips()
  //     }
  //   })
  // }



  // get_all_trips() {
  //   this.trip_service.get_all_trips().subscribe({
  //     next: (res: any) => {
  //       if (res.ok) {
  //         this.all_trips = res.data
  //         console.log(this.all_trips);
  //       }
  //       console.log(res);
  //     },
  //     error: (err) => {
  //       console.log(err.status);
  //     }
  //   })
  // }

  save_trip(trip_data: Itrip) {
    this.trip_service.current_trip.next(trip_data)
    console.log('Saving trip:', trip_data);
    Swal.fire({
      title: `تعديل الرحلة ${trip_data.tripCode} `,
      text: `يمكنك فقط تعديل بيانات السائقين و لوحة السيارة`,
      icon: 'question',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
      cancelButtonText: 'الغاء',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['trips/edit', trip_data.id])
      }
    })
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
          this.get_all_search_trips()
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


  // get_searched_trips() {
  //   let code = this.trip_search_form.get('search_code')?.value
  //   if (code) {
  //     console.log("code", code);
  //     this.trip_service.search_trip_by_code(code).subscribe({
  //       next: (res: any) => {
  //         if (res.ok) {
  //           this.all_trips = res.data
  //         }
  //         console.log(res);
  //       },
  //       error: (err) => {
  //         console.log(err.status);
  //       }
  //     })
  //   }
  //   else {
  //     this.get_all_trips()
  //   }
  // }



  cancel_search() {
    this.trip_search_form.reset();
    // this.get_all_reservations();
    this.search_value = '';
    this.fromDate_search = '';
    this.toDate_search = '';
    this.get_all_search_trips();
  }


  // clear_search() {
  //   this.trip_search_form.reset()
  //   this.get_all_trips()
  // }






  downloadPdf(tripId: string) {
    this.trip_service.exportTripParticipantsToPdf(tripId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TripParticipantsReport.pdf';
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


  book_this_trip(tripId: string) {
    console.log(tripId);
    this.router.navigate(['/Add-Reservation', tripId])
  }





  get_all_search_trips() {
    const { search_code, fromDate, toDate } = this.trip_search_form.value;
    if (!search_code && !fromDate && !toDate) {
      let startDate = new Date();
      const endDate = new Date();

      endDate.setDate(endDate.getDate() + 20);
      startDate.setDate(startDate.getDate() -20);


      this.fromDate_search = this.datePipe.transform(startDate, 'yyyy-MM-dd') || '';
      this.toDate_search = this.datePipe.transform(endDate, 'yyyy-MM-dd') || '';

      this.trip_service.get_all_search_trips(
        search_code, this.fromDate_search, this.toDate_search, this.fromDate_search, this.toDate_search, this.search_mode
      ).subscribe({
        next: (res: any) => {
          this.all_trips = res.ok && res.data.length > 0 ? res.data : [];
          this.all_trips = this.sortTripsByDateDesc(this.all_trips);
        },
        error: (err: any) => {
          console.log('error get trips',err);
        Swal.fire('خطأ', err.error.message, 'error');
          this.cancel_search();
        }
      });

      return
    }

    this.search_value = search_code;
    this.fromDate_search = this.datePipe.transform(fromDate, 'yyyy-MM-dd') || '';
    this.toDate_search = this.datePipe.transform(toDate, 'yyyy-MM-dd') || '';

    this.trip_service.get_all_search_trips(
      search_code, this.fromDate_search, this.toDate_search, this.fromDate_search, this.toDate_search, this.search_mode
    ).subscribe({
      next: (res: any) => {
        this.all_trips = res.ok && res.data.length > 0 ? res.data : [];
        this.all_trips = this.sortTripsByDateDesc(this.all_trips);
      },
      error: (err: any) => {
        console.log('error get trips',err);
        
        console.log(err.error.message);
        Swal.fire('خطأ', err.error.message, 'error');
        this.cancel_search();
      }
    });
  }

  sortTripsByDateDesc(trips: any[]): any[] {
    return trips.sort((a, b) => {
      const dateA = new Date(a.departureTime).getTime();
      const dateB = new Date(b.departureTime).getTime();
      return dateB - dateA; // من الأحدث للأقدم
    });
  }
  

}






