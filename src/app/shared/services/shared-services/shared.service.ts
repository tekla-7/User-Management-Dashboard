import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  public checkpasswordUpperCase(
    control: AbstractControl
  ): null | { noUpperCase: { value: string } } {
    const hasUpperCase = /[A-Z]/.test(control.value);
    return hasUpperCase ? null : { noUpperCase: { value: control.value } };
  }

  public checkpasswordNumber(
    control: AbstractControl
  ): null | { noNumber: { value: number } } {
    const hasNumber = /\d/.test(control.value);
    return hasNumber ? null : { noNumber: { value: control.value } };
  }
}
