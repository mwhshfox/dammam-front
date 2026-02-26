import { Component } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  constructor(private loading_Service: LoadingService) { }



  is_loading$!: boolean;




  ngOnInit(): void {

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loading_Service.show_loader.subscribe((value) => {
      setTimeout(() => {
        this.is_loading$ = value
      }, 0);
    })

  }
}
