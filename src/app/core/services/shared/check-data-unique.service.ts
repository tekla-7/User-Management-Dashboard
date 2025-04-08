import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';

import { AbstractControl, FormGroup } from '@angular/forms';
import { IUser } from '../../models/user.model';
import { API_URLS } from '../../config/api-url';

@Injectable({
  providedIn: 'root',
})
export class CheckDataUniqueService {
  private http = inject(HttpClient);

  private readonly apiUrl = API_URLS;

  public checkEmailUnique(email: string): Observable<boolean> {
      return this.http.get<IUser[]>(`${this.apiUrl}/users?email=${email}`).pipe(
          map((users) => users.length > 0),
          catchError((error) => {
            const errorMessage = 'Error checking email uniqueness'; 
            console.error(errorMessage, error); 
            return throwError(() => new Error(errorMessage)); 
          })
        );
      
  }
 
}

