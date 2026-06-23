import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { Reservation } from '../../../core/models/reservation.model';
import { ReservationsService } from '../../../core/services/reservations.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-payments',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './all-payments.component.html',
  styleUrl: './all-payments.component.scss'
})
export class AllPaymentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reservationsService = inject(ReservationsService);

  searchForm!: FormGroup;
  search_value: string = '';

  table_head_titles: string[] = ['رقم الحجز', 'اسم العميل', 'تاريخ', ' المدفوع', ' المتبقي', 'الإعدادات'];

  all_reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];

  filterOption: 'all' | 'remainingOnly' = 'all';

  show_filter: boolean = true;

  ngOnInit(): void {
    this.initForm();
    this.get_all_reservations();
    this.show_filter_animation();
  }

  initForm(): void {
    const today = this.getTodayDate();

    this.searchForm = this.fb.group({
      invoiceNumber: [''],
      fromDate: [today],
      toDate: [today]
    });
  }

  getTodayDate(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  get_all_reservations(): void {
    this.reservationsService.get_all_reservations().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_reservations = res.data || [];
        } else {
          this.all_reservations = [];
        }

        this.filterReservations();
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.all_reservations = [];
        this.filterReservations();
      }
    });
  }

  search_reservations(): void {
    const { invoiceNumber, fromDate, toDate } = this.searchForm.value;

    if (!fromDate || !toDate) {
      Swal.fire('تنبيه', 'برجاء اختيار تاريخ من يوم وإلى يوم', 'warning');
      return;
    }

   if (new Date(fromDate) > new Date(toDate)) {
         Swal.fire('تنبيه', 'تاريخ النهاية لا يمكن أن يكون أقل من تاريخ البداية', 'warning');  return;
        }

    this.search_value = invoiceNumber || '';
    this.filterReservations();
  }

  cancel_search(): void {
    const today = this.getTodayDate();

    this.searchForm.reset({
      invoiceNumber: '',
      fromDate: today,
      toDate: today
    });

    this.search_value = '';
    this.filterReservations();
  }

  reset_date_to_today(): void {
    const today = this.getTodayDate();

    this.searchForm.patchValue({
      fromDate: today,
      toDate: today
    });

    this.filterReservations();
  }

  filterReservations(): void {
    if (!this.searchForm) {
      this.filteredReservations = [...this.all_reservations];
      return;
    }

    const { invoiceNumber, fromDate, toDate } = this.searchForm.value;

    let result = [...this.all_reservations];

    if (invoiceNumber) {
      result = result.filter(res =>
        res.invoiceNumber?.toString().toLowerCase().includes(invoiceNumber.toString().toLowerCase())
      );
    }

    if (fromDate && toDate) {
      const startDate = new Date(`${fromDate}T00:00:00`);
      const endDate = new Date(`${toDate}T23:59:59`);

      result = result.filter(res => {
        const reservationDateValue = res.fromDate || res.toDate;

        if (!reservationDateValue) {
          return false;
        }

        const reservationDate = new Date(reservationDateValue);

        return reservationDate >= startDate && reservationDate <= endDate;
      });
    }

    if (this.filterOption === 'remainingOnly') {
      result = result.filter(res => res.remainingMoney > 0);
    }

    this.filteredReservations = result;
  }

  show_delete_alert(id: string): void {
    Swal.fire({
      text: ` هل ترغب في حذف هذا الحجز نهائياً ؟ `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      cancelButtonColor: '#b0b0b0',
      confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
      cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
    }).then((result) => {
      if (result.isConfirmed) {
        this.delete_reservation(id);
      }
    });
  }

  delete_reservation(id: string): void {
    this.reservationsService.delete_reservation(id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.get_all_reservations();
        }
      }
    });
  }

  show_filter_animation(): void {
    setTimeout(() => {
      this.show_filter = false;
    }, 3000);
  }
}