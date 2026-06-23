import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReservationsService } from '../../../core/services/reservations.service';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { CommonModule } from '@angular/common';
import { iPaymentHistory, Reservation } from '../../../core/models/reservation.model';
import { UsersService } from '../../../core/services/users.service';
import { EnumPipe } from "../../../shared/pipes/enum.pipe";
import { reservation_client } from '../../../core/models/reservation.model';
@Component({
  selector: 'app-show-invoice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, EnumPipe],
  templateUrl: './show-invoice.component.html',
  styleUrl: './show-invoice.component.scss'
})
export class ShowInvoiceComponent {
  paymentForm!: FormGroup;

  totalAmount: number = 0;
  totalPaid: number = 0;

  reservationId: string = '';
  reservation: Reservation = {} as Reservation;
  all_users: reservation_client[] = [];
  all_payment_history: iPaymentHistory[] = [];
  employeeId: string = '';
  done_loop: boolean = false;
  emp_created_reservation_name: string = '';
  is_admin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private reservationService: ReservationsService,
    private paymentService: PaymentService,
    private reservationsService: ReservationsService,
    private userService: UsersService
  ) { }

  ngOnInit(): void {
    // 1. استقبال ID من الـ Route
    this.reservationId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log('reservationId', this.reservationId);
    this.employeeId = localStorage.getItem('userId') ?? '';
    console.log('employeeId ======', this.employeeId);
    this.get_permissions();
    if (this.reservationId) {
      this.get_one_reservation();
    }

    // 2. تهيئة النموذج
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: [null, [Validators.required]]
    });

    this.paymentForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateValues();
    });

    this.paymentService.current_stage.next('edit')
  }

  get newPaid(): number {
    const input = this.paymentForm.get('amount')?.value || 0;
    return this.totalPaid + parseFloat(input);
  }

  get remainingAfter(): number {
    return Math.max(this.totalAmount - this.newPaid, 0);
  }

  calculateValues() {
    // هنا فقط لتحديث القيم تلقائيًا
  }

  get_one_reservation() {
    this.reservationService.get_reservation_by_id(this.reservationId).subscribe({
      next: (res) => {
        console.log('reservation', res);
        this.reservation = res.data;

        this.get_payment_history();
        // 3. ربط القيم
        this.totalAmount = this.reservation.totalInvoice;
        this.totalPaid = this.reservation.moneyPaid;
        this.all_users = this.reservation.customerReservations;
        this.get_employee_by_id(this.reservation.employeeId);
        // for (const user of res.data.clientsIds) {
        //   this.get_user_by_id(user);
        //   ;
        // }

      },
      error: (err) => {
        console.error('فشل في جلب البيانات:', err);
        Swal.fire('خطأ!', 'تعذر تحميل بيانات الحجز', 'error');
      }
    });
  }

  get_employee_by_id(employeeId: string) {
    this.userService.get_user_by_id(employeeId).subscribe({
      next: (res) => {
        console.log('employee', res);
        this.emp_created_reservation_name = res.data.fullName;
      },
      error: (err) => {
        console.error('فشل في جلب البيانات:', err);
        Swal.fire('خطأ!', 'تعذر تحميل بيانات الموظف', 'error');
      }
    });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    // Swal.fire('تم!', `تم سداد ${this.paymentForm.value.amount} ر.س بنجاح`, 'success');

    const newPayment = {
      moneyPaid: this.paymentForm.value.amount,
      reservationId: this.reservationId,
      paymentMethod: this.paymentForm.value.paymentMethod,
      userId: this.reservation.clientsIds?.[0],
      employeeId: this.employeeId
    }
    console.log('reservation clientsIds', this.reservation.clientsIds);

    console.log('newPayment', newPayment);

    // ⚠️ هنا لازم تستدعي API الدفع الحقيقي، مثلاً:
    this.paymentService.pay_reservation(newPayment).subscribe({
      next: () => {
        Swal.fire('تم!', `تم سداد ${newPayment.moneyPaid} ر.س بنجاح`, 'success');
        // this.totalPaid += newPayment.moneyPaid;
        this.paymentForm.reset();
        this.get_one_reservation();
        this.get_payment_history();
      },
      error: () => {
        Swal.fire('خطأ!', 'حدث خطأ أثناء تنفيذ الدفع', 'error');
      }
    });
  }

  // get_user_by_id(user_id: string) {
  //   this.userService.get_user_by_id(user_id).subscribe({
  //     next: (res) => {
  //       console.log('user', res);
  //       this.all_users.push(res.data);
  //     },
  //     error: (err) => {
  //       console.error('فشل في جلب البيانات:', err);
  //       Swal.fire('خطأ!', 'تعذر تحميل بيانات المستخدم', 'error');
  //     }
  //   });
  // }

  get_payment_history() {
    this.paymentService.payment_history(this.reservationId).subscribe({
      next: (res) => {
        console.log('payments', res);
        this.all_payment_history = res.data;
      },
      error: (err) => {
        console.error('فشل في جلب البيانات:', err);
        Swal.fire('خطأ!', 'تعذر تحميل بيانات الدفعات', 'error');
      }
    });
  }

  get remaining(): number {
    return Math.max(this.totalAmount - this.totalPaid, 0);
  }



  export_qiod_payment(payment_id: string, qyoud_payment_id: string, index: number) {

    if (qyoud_payment_id) {
      Swal.fire('مسجل بالفعل', 'هذا السند مسجل بالفعل', 'warning');
      return
    }

    this.reservationsService.export_qiod_payment(payment_id).subscribe({
      next: (res: any) => {
        console.log("قيووووود سند ############## ", res);
        if (res.ok) {
          this.all_payment_history[index].qoyodPaymentId = res.data;
          Swal.fire('نجاح', res.message || 'تم تصدير السند الي نظام قيود بنجاح', 'success');
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
