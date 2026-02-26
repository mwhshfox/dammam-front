import { Component, inject } from '@angular/core';
import { Ihotel } from '../../../core/models/ihotel';
import { HotelsService } from '../../../core/services/hotels.service';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-hotels',
  standalone: true,
  imports: [EnumPipe, RouterLink],
  templateUrl: './all-hotels.component.html',
  styleUrl: './all-hotels.component.scss'
})
export class AllHotelsComponent {
  table_head_titles: string[] = [
    '#',
    'الاسم',
    'العنوان',
    'مدينة',
    'سعر السرير',
    'سعر الغرفة',
  ]

  all_hotels: Ihotel[] = []

  private currentID: string = ''
  current_name: string = ''
  private readonly hotelService = inject(HotelsService);
  constructor() { };

  ngOnInit(): void {
    this.get_all_hotel()
    this.hotelService.current_stage.next('all')

  }

  get_all_hotel() {
    this.hotelService.get_all_hotels().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_hotels = res.data
          console.log(this.all_hotels);
        }
        console.log(res);
      }
    })
  }


  save_hotel(hotel_data: Ihotel) {
    this.hotelService.current_client.next(hotel_data)
    console.log(hotel_data);
  }


  

  show_delete_alert(hotel_name: string, hotel_id: string) {
    Swal.fire({
      title: `  ${hotel_name}  `,
      text: ` هل ترغب في حذف هذا الفندق نهائياً ؟ `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B50D0D',
      cancelButtonColor: '#b0b0b0',
      confirmButtonText: 'تأكيد  <i class="fa-solid fa-trash-can"></i>',
      cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
    }).then((result) => {
      if (result.isConfirmed) {
        this.delete_item(hotel_id)
      }
    });
  }


  delete_item(item_ID: string) {
    this.hotelService.delete_hotel(item_ID).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.delete_succes_alert()
          this.get_all_hotel()
        }
        else {
          console.log(res);
          Swal.fire(
            "خطأ", res.message, "error"
          )
        }
      },
      error: (err) => {
        console.log('erroreeeeeeeeeeeee',err);
        
        Swal.fire(
          "خطأ", err.error.message, "error"
        )
      }
    })
  }


  delete_succes_alert() {
    Swal.fire({
      title: `تم الحذف `,
      text: `  تم حذف الفندق بنجاح`,
      icon: 'success',
      confirmButtonColor: '#B50D0D',
      confirmButtonText: 'موافق',
    })
  }
  

}
