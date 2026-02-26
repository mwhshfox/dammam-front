import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { ShowInvoiceComponent } from "../../reports/show-invoice/show-invoice.component";

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ShowInvoiceComponent],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss'
})
export class PaymentPageComponent {
  private readonly payment_Service = inject(PaymentService);
  private readonly router = inject(Router);
  constructor() { };


  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_current_stage()
  }

  print(){
    window.print();
  }

  get_current_stage() {
    this.payment_Service.current_stage.subscribe((value) => {
      setTimeout(() => {
        this.current_stage = value
        console.log(value);

      }, 0);
    })
  }


}
