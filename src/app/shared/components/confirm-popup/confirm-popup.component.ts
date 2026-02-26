import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-confirm-popup',
  standalone: true,
  imports: [],
  templateUrl: './confirm-popup.component.html',
  styleUrl: './confirm-popup.component.scss'
})
export class ConfirmPopupComponent {
  @Input() onConfirm: () => void = () => { };
  @Input() onCancel: () => void = () => { };
  @Input({required:true}) message!:string
  @Input() item_name:string = ""


}
