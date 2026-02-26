import { Component, Input, OnInit, Output, Type, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientsService } from '../../../core/services/clients.service';
import { Router, RouterLink } from '@angular/router';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { iUser } from '../../../core/models/admins.models';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-client',
  standalone: true,
  imports: [ReactiveFormsModule, EnumPipe, SweetAlert2Module],
  templateUrl: './edit-client.component.html',
  styleUrl: './edit-client.component.scss'
})
export class EditClientComponent {
  constructor(private fb: FormBuilder, private clientsService: ClientsService) { }
  private readonly router = inject(Router);
  @Input() current_user: iUser = {} as iUser

  clientForm!: FormGroup;
  current_client: iUser = {} as iUser
  countries: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,19,20,21,22,23,24,25,26,27,28,29]

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      id: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nationalityId: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
      nationality: [null, Validators.required],
      gender: [null, Validators.required],
      role: ['user']
    });

    this.clientsService.current_stage.next('edit')

    this.get_current_client();
  }

  get_current_client() {
    this.clientsService.current_client.subscribe(value => {
      this.current_client = value as iUser
      if (this.current_client.id) {
        console.log('yoooogaaad');

      }
      else {
        console.log('rughhhhhhhhhhht');
        this.router.navigate(['admin/all-admins'])
      }
    }).unsubscribe()

    this.clientForm.patchValue(this.current_client)
  }

  submit_form() {
    if (this.clientForm.valid) {
      console.log('clientForm-value:', this.clientForm.value);
      this.send_new_client(this.clientForm.value)
    }
    else {
      this.clientForm.markAllAsTouched();
      console.log('form is not valid', this.clientForm);
    }

  }


  send_new_client(body: {}) {
    this.clientsService.edit_client(body).subscribe({
      next: (res: any) => {
        if (res.message == "نجاح ") {
          console.log(res);
          this.show_succes_alert()
          this.clientForm.reset();
          this.clientForm.get("role")?.setValue('user')
        }
        else {
          console.log("elseee", res.message);
          Swal.fire(
            "خطأ", res.message , "error"
          )
        }
      },


      error: (err) => {
        console.log(err);
        console.log(err.error.errors);
        Swal.fire(
          "خطأ", err.error.message , "error"
        )
      }
    })
  }


  show_succes_alert() {
    Swal.fire({
      title: `تم التعديل بنجاح`,
      text: `  تم تعديل بيانات العميل بنجاح`,
      icon: 'success',
      // showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      // cancelButtonColor: '#3085d6',
      confirmButtonText: 'موافق',
      // cancelButtonText: 'اضافة جديد + ' 
    }).then((result) => {
        this.router.navigate(['clients'])      
    });
  }

}
