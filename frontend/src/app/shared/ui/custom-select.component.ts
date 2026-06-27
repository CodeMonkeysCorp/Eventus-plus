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
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

export type CustomSelectValue = string | number | null;

export interface CustomSelectOption {
  value: CustomSelectValue;
  label: string;
  hint?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomSelectComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private ngControl: NgControl | null = null;

  @Input() inputId = '';
  @Input() placeholder = 'Selecione';
  @Input() options: ReadonlyArray<CustomSelectOption> = [];

  value: CustomSelectValue = null;
  isOpen = false;
  disabled = false;

  private onChange: (value: CustomSelectValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, InjectFlags.Self | InjectFlags.Optional);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get displayLabel(): string {
    return this.selectedOption?.label ?? this.placeholder;
  }

  get isPlaceholder(): boolean {
    return this.selectedOption === null || this.selectedOption.value === null;
  }

  get showInvalid(): boolean {
    return !!this.ngControl?.invalid && !!(this.ngControl.touched || this.ngControl.dirty);
  }

  get selectedOption(): CustomSelectOption | null {
    return this.options.find((option) => isSameSelectValue(option.value, this.value)) ?? null;
  }

  writeValue(value: CustomSelectValue): void {
    this.value = value ?? null;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: CustomSelectValue) => void): void {
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
    if (!this.isOpen) {
      this.markTouched();
    }
  }

  select(option: CustomSelectOption): void {
    if (option.disabled) {
      return;
    }

    this.value = option.value;
    this.onChange(option.value);
    this.isOpen = false;
    this.markTouched();
  }

  isSelected(option: CustomSelectOption): boolean {
    return isSameSelectValue(option.value, this.value);
  }

  trackByOption(_index: number, option: CustomSelectOption): string {
    return `${option.value ?? 'null'}-${option.label}`;
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

  private markTouched(): void {
    this.onTouched();
  }
}

function isSameSelectValue(left: CustomSelectValue, right: CustomSelectValue): boolean {
  return left === right;
}
