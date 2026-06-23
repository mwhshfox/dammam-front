// date-picker.component.ts
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() minDate?: string | Date;
  @Input() maxDate?: string | Date;
  @Input() defaultwidth?: boolean = true;
  @Input() placeholder: string = 'اختر التاريخ';
  @Input() disabled: boolean = false;
  @Output() dateChange = new EventEmitter<Date | null>();

  showCalendar = false;
  selectedDate: Date | null = null;
  displayValue = '';
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  today = new Date();
  calendarDays: any[] = [];

  arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  arabicDaysOfWeek = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']; // الأحد إلى السبت

  private onChange = (value: Date | null) => { };
  private onTouched = () => { };

  ngOnInit() {
    this.today.setHours(0, 0, 0, 0);
    this.generateCalendar();
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-date-picker')) {
      this.showCalendar = false;
    }
  }

  // // ControlValueAccessor methods
  // writeValue(value: Date | null): void {
  //   this.selectedDate = value;
  //   this.displayValue = value ? this.formatDateToArabic(value) : '';
  //   if (value) {
  //     this.currentMonth = value.getMonth();
  //     this.currentYear = value.getFullYear();
  //   }
  //   this.generateCalendar();
  // }
  // ControlValueAccessor methods
  // ############################### start new function by shaabaaaan #####################
  // ############################### start new function by shaabaaaan #####################
  // ############################### start new function by shaabaaaan #####################
  writeValue(value: Date | any | null): void {
    console.log('valueeeeeeee befoooooooooore writeValue', value);

    if (value && typeof value === 'string') {
      const cleanDate = value.split('T')[0]; // يتجاهل التوقيت لو موجود
      const [year, month, day] = cleanDate.split('-').map(Number);
      value = new Date(year, month - 1, day); // تاريخ محلي مضبوط
    }

    console.log('valueeeeeeee afteeeeeeeer writeValue', value);

    this.selectedDate = value;
    this.displayValue = value ? this.formatDateToArabic(value) : '';

    if (value instanceof Date) {
      this.currentMonth = value.getMonth();
      this.currentYear = value.getFullYear();
    }

    this.generateCalendar();
  }
  // ############################### end new function by shaabaaaan #####################
  // ############################### end new function by shaabaaaan #####################
  // ############################### end new function by shaabaaaan #####################

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleCalendar() {
    if (!this.disabled) {
      this.showCalendar = !this.showCalendar;
      if (this.showCalendar) {
        this.generateCalendar();
      }
    }
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === this.currentMonth;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedDate &&
        date.getTime() === this.selectedDate.getTime();

      this.calendarDays.push({
        date: date,
        currentMonth: isCurrentMonth,
        today: isToday,
        selected: isSelected,
        enabled: isCurrentMonth
      });
    }
  }

  selectDate(date: Date) {
    if (this.isDateDisabled(date)) return;

    this.selectedDate = new Date(date);
    this.displayValue = this.formatDateToArabic(this.selectedDate);
    this.showCalendar = false;
    this.onChange(this.selectedDate);
    this.dateChange.emit(this.selectedDate);
    this.onTouched();
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  selectToday() {
    const today = new Date();
    if (!this.isDateDisabled(today)) {
      this.selectDate(today);
    }
  }

  clearDate() {
    this.selectedDate = null;
    this.displayValue = '';
    this.showCalendar = false;
    this.onChange(null);
    this.dateChange.emit(null);
    this.onTouched();
  }

  getArabicMonthName(month: number): string {
    return this.arabicMonths[month];
  }

  isSameDate(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }


  // formatDateToArabic(date: Date): string {
  //   const day = date.getDate().toString().padStart(2, '0');
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

// ############################### new function by shaabaaaan #####################
// ############################### new function by shaabaaaan #####################
// ############################### new function by shaabaaaan #####################
  formatDateToArabic(date: Date | string): string {
    console.log('befoooooooor formatDateToArabic', date);
  
    if (typeof date === 'string') {
      const cleanDate = date.split('T')[0]; // تجاهل التوقيت إن وُجد
      const [year, month, day] = cleanDate.split('-').map(Number);
      date = new Date(year, month - 1, day); // توقيت محلي
    }
  
    console.log('afteeeeeer formatDateToArabic', date);
  
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return ''; // يرجع فاضي لو التاريخ مش صالح
    }
  
    const dayStr = date.getDate().toString().padStart(2, '0');
    const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
  
    return `${dayStr}/${monthStr}/${year}`;
  }
  // ############################### end new function by shaabaaaan #####################
  // ############################### end new function by shaabaaaan #####################
  // ############################### end new function by shaabaaaan #####################

  isDateDisabled(date: Date): boolean {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (this.minDate) {
      const minDate = typeof this.minDate === 'string'
        ? new Date(this.minDate)
        : new Date(this.minDate);
      minDate.setHours(0, 0, 0, 0);
      if (checkDate < minDate) return true;
    }

    if (this.maxDate) {
      const maxDate = typeof this.maxDate === 'string'
        ? new Date(this.maxDate)
        : new Date(this.maxDate);
      maxDate.setHours(0, 0, 0, 0);
      if (checkDate > maxDate) return true;
    }

    return false;
  }

  isTodayDisabled(): boolean {
    return this.isDateDisabled(this.today);
  }
}