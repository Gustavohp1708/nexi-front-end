import { Component, forwardRef, input, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type InputTypes = "text" | "email" | "password";

@Component({
  selector: 'app-primary-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
],
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PrimaryInputComponent),
    multi: true
  }
],
  templateUrl: './primary-input.component.html',
  styleUrls: ['./primary-input.component.scss']
})
export class PrimaryInputComponent implements ControlValueAccessor{
  
  @Input() type: string = "text";
  @Input() placeholder: string = "";
  @Input() label: string = "";
  @Input() inputName: string = "";

  value: string = "";
  onChange = (value: string) => {} 
  onTouched = () => {}

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}
  
}