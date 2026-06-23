import { CommonModule } from '@angular/common';
import { Component, inject, AfterViewInit } from '@angular/core';
import * as L from 'leaflet'

const DefaultIcon = L.icon({
  iconRetinaUrl: 'media/leafleft/marker-icon-2x.png',
  iconUrl: 'media/leafleft/marker-icon.png',
  shadowUrl: 'media/leafleft/marker-shadow.png',
  iconSize: [25, 41],        // الحجم الافتراضي
  iconAnchor: [12, 41],      // نقطة التثبيت المناسبة
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

  private map!: L.Map;

  ngAfterViewInit(): void {
    const isMobile = window.innerWidth < 768;

    const zoom = isMobile ? 15 : 13;   // ⬅ رفع الزوم للموبايل يخلي الدبوس ثابت وصح

    this.map = L.map('map').setView([26.42455542567631, 50.0968293816056], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    L.marker([26.42455542567631, 50.0968293816056]).addTo(this.map)
      .bindPopup('بورصة الدمام لخدمات للعمرة والنقليات')
      .openPopup();

    // مهم جدًا لإصلاح الحسابات على الموبايل
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }



  trackByIndex(index: number): number {
    return index;
  }

}
