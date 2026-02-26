import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Reservation } from '../../../core/models/reservation.model';
import { inject } from '@angular/core';
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
  private readonly fb = inject(FormBuilder); // ✅

  searchForm!: FormGroup;
  search_value: string = '';

  table_head_titles: string[] = ['رقم الحجز', 'اسم العميل', 'تاريخ', ' المدفوع', ' المتبقي', 'الإعدادات'];

  all_reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];

  filterOption: 'all' | 'remainingOnly' = 'all'; // قيمة افتراضية

  show_filter: boolean = true;

  private readonly reservationsService = inject(ReservationsService);

  ngOnInit(): void {
    this.get_all_reservations();
    this.initForm();
    this.show_filter_animation()
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
        if (res.ok) {
          this.all_reservations = res.data || [];
          this.filterReservations();
        }
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
      }
    });
  }

  search_reservations() {
    const { invoiceNumber, fromDate, toDate } = this.searchForm.value;
    if (!invoiceNumber) {return}
    this.search_value = invoiceNumber;
    this.reservationsService.get_all_reservations(
      invoiceNumber, fromDate, toDate, '', ''
    ).subscribe({
      next: (res: any) => {
        this.all_reservations = res.ok && res.data.length > 0 ? res.data : [];
        this.filterReservations()
        console.log('this.all_reservationsssssssssssssssssss', this.all_reservations);
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
    this.get_all_reservations();
    this.search_value = '';
  }

  filterReservations() {
    if (this.filterOption === 'remainingOnly') {
      this.filteredReservations = this.all_reservations.filter(res => res.remainingMoney > 0);
    } else {
      this.filteredReservations = [...this.all_reservations];
    }
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
      if (result.isConfirmed) {
        this.delete_reservation(id)
      }
    });
  }
  delete_reservation(id: string) {
    this.reservationsService.delete_reservation(id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.get_all_reservations();
        }
      }
    })
  }

  show_filter_animation() {
    setTimeout(() => {
      this.show_filter = false;
    }, 3000);
  }
}
