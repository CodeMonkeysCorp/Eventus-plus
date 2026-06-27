import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  InjectFlags,
  Injector,
  Input,
  OnInit,
  forwardRef,
  inject
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { CustomSelectComponent, CustomSelectOption } from './custom-select.component';

interface CalendarDay {
  date: Date;
  label: number;
  isOutsideMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;
const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const HOUR_OPTIONS = createNumberOptions(24);
const MINUTE_OPTIONS = createNumberOptions(60);

@Component({
  selector: 'app-custom-date-time-field',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './custom-date-time-field.component.html',
  styleUrl: './custom-date-time-field.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDateTimeFieldComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomDateTimeFieldComponent implements ControlValueAccessor, OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private ngControl: NgControl | null = null;

  @Input() inputId = '';
  @Input() placeholder = 'Selecione data e hora';

  value = '';
  isOpen = false;
  disabled = false;
  visibleMonth = startOfMonth(new Date());

  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly hourOptions = HOUR_OPTIONS;
  readonly minuteOptions = MINUTE_OPTIONS;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, InjectFlags.Self | InjectFlags.Optional);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get monthLabel(): string {
    return formatMonthLabel(this.visibleMonth);
  }

  get displayValue(): string {
    return this.value ? DATE_TIME_LABEL_FORMATTER.format(parseLocalDateTime(this.value) ?? new Date()) : '';
  }

  get selectedHour(): number {
    return (parseLocalDateTime(this.value) ?? defaultWorkingDate()).getHours();
  }

  get selectedMinute(): number {
    return (parseLocalDateTime(this.value) ?? defaultWorkingDate()).getMinutes();
  }

  get showInvalid(): boolean {
    return !!this.ngControl?.invalid && !!(this.ngControl.touched || this.ngControl.dirty);
  }

  get calendarDays(): CalendarDay[] {
    return buildCalendarDays(this.visibleMonth, parseLocalDateTime(this.value));
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    if (!this.isOpen) {
      this.syncVisibleMonth();
    }
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.isOpen = false;
    }
    this.changeDetectorRef.markForCheck();
  }

  toggleOpen(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.syncVisibleMonth();
      return;
    }

    this.markTouched();
  }

  showPreviousMonth(): void {
    this.visibleMonth = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() - 1, 1);
  }

  showNextMonth(): void {
    this.visibleMonth = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() + 1, 1);
  }

  selectDay(day: CalendarDay): void {
    const baseDate = parseLocalDateTime(this.value) ?? defaultWorkingDate();
    const nextDate = new Date(
      day.date.getFullYear(),
      day.date.getMonth(),
      day.date.getDate(),
      baseDate.getHours(),
      baseDate.getMinutes(),
      0,
      0
    );

    this.commit(nextDate);
  }

  selectHour(hour: number | null): void {
    if (hour === null) {
      return;
    }

    const nextDate = parseLocalDateTime(this.value) ?? defaultWorkingDate();
    nextDate.setHours(hour, nextDate.getMinutes(), 0, 0);
    this.commit(nextDate);
  }

  selectMinute(minute: number | null): void {
    if (minute === null) {
      return;
    }

    const nextDate = parseLocalDateTime(this.value) ?? defaultWorkingDate();
    nextDate.setHours(nextDate.getHours(), minute, 0, 0);
    this.commit(nextDate);
  }

  clear(): void {
    this.value = '';
    this.onChange('');
    this.markTouched();
    this.visibleMonth = startOfMonth(new Date());
  }

  pickToday(): void {
    this.commit(new Date());
  }

  trackByDay(_index: number, day: CalendarDay): string {
    return formatCalendarDayKey(day.date);
  }

  @HostListener('document:mousedown', ['$event'])
  handleDocumentMouseDown(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.markTouched();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.markTouched();
  }

  private commit(date: Date): void {
    this.value = toLocalDateTimeValue(date);
    this.onChange(this.value);
    this.markTouched();
    this.visibleMonth = startOfMonth(date);
  }

  private syncVisibleMonth(): void {
    this.visibleMonth = startOfMonth(parseLocalDateTime(this.value) ?? new Date());
  }

  private markTouched(): void {
    this.onTouched();
  }
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric'
});

const DATE_TIME_LABEL_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

function formatMonthLabel(date: Date): string {
  const label = MONTH_FORMATTER.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildCalendarDays(visibleMonth: Date, selectedDate: Date | null): CalendarDay[] {
  const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const firstVisibleDay = new Date(firstDayOfMonth);
  firstVisibleDay.setDate(firstVisibleDay.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);

    return {
      date: day,
      label: day.getDate(),
      isOutsideMonth: day.getMonth() !== visibleMonth.getMonth(),
      isToday: isSameCalendarDay(day, new Date()),
      isSelected: isSameCalendarDay(day, selectedDate)
    };
  });
}

function createNumberOptions(limit: number): CustomSelectOption[] {
  return Array.from({ length: limit }, (_, value) => ({
    value,
    label: `${value}`.padStart(2, '0')
  }));
}

function defaultWorkingDate(): Date {
  const date = new Date();
  date.setHours(DEFAULT_HOUR, DEFAULT_MINUTE, 0, 0);
  return date;
}

function formatCalendarDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameCalendarDay(left: Date | null, right: Date | null): boolean {
  if (!left || !right) {
    return false;
  }

  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function parseLocalDateTime(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toLocalDateTimeValue(date: Date): string {
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}
