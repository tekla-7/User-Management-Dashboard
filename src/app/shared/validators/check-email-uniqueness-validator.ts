import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  catchError,
  delay,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { CheckDataUniqueService } from '../../core/services/shared/check-data-unique.service';

export function emailAsyncValidator(
  checkDataUnique: CheckDataUniqueService
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      delay(300),
      distinctUntilChanged(),
      switchMap((email) => checkDataUnique.checkEmailUnique(email)),
      map((emailExists) => {
        return emailExists ? { 
          emailNotUnique: true,
          emailNotUniqueMessage: 'This email already exists' 
        } : null;
      }),
      catchError((error: any) => {
        let errorMessage = 'Error occured';
        if (error?.error?.errors?.Email) {
          errorMessage = error?.error?.errors?.Email[0];
        }

        return of({
          checkEmailUniqueError: true,
          checkEmailUniqueErrorMessage: errorMessage,
        });
      })
    );
   
  };
}

