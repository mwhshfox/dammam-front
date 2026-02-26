import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReservationsService } from '../../../core/services/reservations.service';
import { UsersService } from '../../../core/services/users.service';
import { HotelsService } from '../../../core/services/hotels.service';
import { Ihotel } from '../../../core/models/ihotel';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { DatePipe } from '@angular/common';
import { TripsService } from '../../../core/services/trips.service';
import { ReportsService } from '../../../core/services/reports.service';
import Swal from 'sweetalert2';
import saveAs from 'file-saver';
import { reservation_client } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-show-reservation-by-id',
  standalone: true,
  imports: [EnumPipe, DatePipe],
  templateUrl: './show-reservation-by-id.component.html',
  styleUrls: ['./show-reservation-by-id.component.scss']
})
export class ShowReservationByIdComponent {

  constructor(private activatedRoute: ActivatedRoute,
    private reservationsService: ReservationsService,
    private usersService: UsersService,
    private hotelsService: HotelsService,
    private reports_Service: ReportsService,
    private tripsService: TripsService
  ) { }

  table_head_titles: string[] = [
    'الإسم',
    // 'الإسم الأخير',
    'رقم الهاتف',
    'رقم الهوية',
    'الجنسية',
    'الجنس'
  ];

  trip_head_titles: string[] = [
    // 'نوع الرحلة',
    'كود الرحلة',
    'الوجهة',
    'تاريخ',
    'سعر الكرسي'
  ];

  reservation_data: any = {};
  // الأعضاء
  users_data: reservation_client[] = [];
  // معرف الحجز
  reservation_id: string | null = '';
  isDeletedView = false;

  // المبلغ المدفوع
  total_invoice: number = 0;
  total_paid: number = 0;
  remaining_money: number = 0;
  // بيانات الفندق
  hotel_data: Ihotel = {} as Ihotel;
  residence_from_date: string = '';
  residence_to_date: string = '';
  // بيانات الرحلة
  trips: any = {};
  trips_details: any[] = [];
  bus_chair_price: number = 0;
  return_bus_chair_price: number = 0;
  trip_type: number = 0;
  payment_method: number = 0;
  employee_name: string = '';

  ngOnInit(): void {
    this.isDeletedView = this.activatedRoute.snapshot.routeConfig?.path?.includes('show-deleted-Reservation') || false;
    this.activatedRoute.paramMap.subscribe(params => {
      this.reservation_id = params.get('reservation_id');
      if (this.reservation_id) {
        this.reservationsService.get_reservation_by_id(this.reservation_id, this.isDeletedView).subscribe({
          next: (res: any) => {
            if (res.ok) {
              // تفاصيل المبلغ
              this.reservation_data = res.data;
              this.total_invoice = res.data.totalInvoice;
              this.total_paid = res.data.moneyPaid;
              this.payment_method = res.data.paymentMethod || 0;
              this.remaining_money = res.data.remainingMoney;
              this.users_data = res.data.customerReservations;
              // بيانات الأعضاء
              // for (const user of res.data.clientsIds) {
              //   this.get_user_by_id(user);
              // }
              // بيانات الفندق
              if (res.data.residenceDto) {
                this.get_hotel_by_id(res.data.residenceDto.hotelId);
                this.residence_from_date = res.data.residenceDto.fromDate;
                this.residence_to_date = res.data.residenceDto.toDate;
              }
              // بيانات الرحلة
              if (res.data.ticketDto) {
                this.trips = res.data.ticketDto;
                this.bus_chair_price = res.data.busChairPrice;
                this.return_bus_chair_price = res.data.returnBusChairPrice;
                this.trip_type = res.data.ticketDto.tripTicketType;

                this.trips.tripTickets?.forEach((trip: any, index: number) => {
                  this.get_trip_by_id(trip.tripId, trip, index);
                });

              }

              this.get_employee_by_id(res.data.employeeId);
            }
          }
        })
      }
    });
  }

  // get_user_by_id(user_id: string) {
  //   this.usersService.get_user_by_id(user_id).subscribe({
  //     next: (res: any) => {
  //       if (res.ok) {
  //         this.users_data.push(res.data)
  //       }
  //     }
  //   });
  // }

  get_employee_by_id(employee_id: string) {
    this.usersService.get_user_by_id(employee_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.employee_name = res.data.firstName + ' ' + res.data.lastName
        }
      }
    })
  }

  get_hotel_by_id(hotel_id: string) {
    this.hotelsService.get_hotel_by_id(hotel_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.hotel_data = res.data
        }
      }
    })
  }

  get_trip_by_id(trip_id: string, chairs_data: any, orderIndex: number) {
    this.tripsService.get_trip_by_id(trip_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          const trip = res.data
          trip.reserved_chairs = {
            ...chairs_data,
            departureReservedChairs: this.sortSeatsString(chairs_data?.departureReservedChairs),
            returnReservedChairs: this.sortSeatsString(chairs_data?.returnReservedChairs),
            transitReservedChairs: this.sortSeatsString(chairs_data?.transitReservedChairs)
          }
          console.log('trip reserved chairs', trip.reserved_chairs);
          
          this.trips_details[orderIndex] = trip;
          this.trips_details = [...this.trips_details];
          console.log('Ordered trips', this.trips_details);
        }
      }
    })
  }

  private sortSeatsString(seats?: string | null): string {
    if (!seats || !seats.trim()) {
      return '';
    }
    return seats
      .split(',')
      .map(seat => seat.trim())
      .filter(seat => seat)
      .sort((a, b) => Number(a) - Number(b))
      .join(',');
  }

  tst() {
    console.log([1, 4, 3].sort((a, b) => a - b));
  }





  downloadPdf(tripId: string | null) {
    // this.reports_Service.exportInvoiceReport(tripId ? tripId : '').subscribe({
    //   next: (blob: Blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'InvoiceReport.pdf';
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //   },
    //   error: (err) => {
    //     console.error('Download failed:', err);
    //     Swal.fire(
    //       "خطأ", err.message, "error"
    //     )
    //   }
    // });
    // تحميل تقرير تركيب الباص (Excel)
    // downloadBusSetupReport(tripId: string) {
    this.reports_Service.exportInvoiceReport(tripId ? tripId : '').subscribe(file => {
      saveAs(file, `InvoiceReport.pdf`);
    });
    // }
  }


  printPdf(tripId: string | null) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportInvoiceReport(tripId).subscribe({
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


  openInvoice(tripId: string | null) {
    if (!tripId) {
      Swal.fire("تنبيه", "رقم الرحلة غير موجود", "warning");
      return;
    }

    this.reports_Service.exportInvoiceReport(tripId).subscribe({
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


// تفاصيل الرحله بال id
// {
//   "ok": true,
//   "message": "string",
//   "data": {
//     "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "chairPrice": 0,
//     "busType": 0,
//     "numberOfChairs": 0,
//     "driverName1": "string",
//     "driverName2": "string",
//     "departureTime": "2025-05-01T17:45:48.955Z",
//     "returnTime": "2025-05-01T17:45:48.955Z",
//     "fromCity": 1,
//     "toCity": 1,
//     "tripCode": "string",
//     "tickets": [
//       {
//         "tripId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//         "chairsIDs": "string"
//       }
//     ],
//     "departureReservedChairs": "string",
//     "returnReservedChairs": "string"
//   }
// }