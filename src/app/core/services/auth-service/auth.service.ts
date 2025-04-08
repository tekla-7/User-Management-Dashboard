import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { API_URLS } from '../../config/api-url';
import { IUser } from '../../models/user.model';
import { Data } from '@angular/router';
import { CheckDataUniqueService } from '../shared/check-data-unique.service';

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_URLS;
  private readonly CheckDataUniqueService = inject(CheckDataUniqueService);
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.userFromStorage();
  }

  public register(user: IUser): Observable<IUser> {
    const uniqueId: number = Date.now();
    const isAdmin: boolean = false;
    const userWithId: IUser = { ...user, id: uniqueId, isAdmin: isAdmin };

    return this.CheckDataUniqueService.checkEmailUnique(user.email).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => new Error('Email already exists'));
        }
        return this.http.post<IUser>(`${this.apiUrl}/users`, userWithId);
      }),
      tap((newUser) => {
        const { password, ...userWithoutPassword } = newUser;
        this.setCurrentUser(userWithoutPassword);
      }),
      catchError(this.handleError('Registration failed'))
    );
  }

  public login(email: string, password: string): Observable<IUser> {
    return this.http.get<IUser[]>(`${this.apiUrl}/users?email=${email}`).pipe(
      map((users) => {
        if (users.length === 0) {
          throw new Error('User not found');
        }

        const user = users[0];
        if (user.password !== password) {
          throw new Error('Invalid password');
        }

        return user;
      }),
      tap((user) => {
        const { password, ...userWithoutPassword } = user;
        this.setCurrentUser(userWithoutPassword);
      }),
      catchError(this.handleError('Login failed'))
    );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  public getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }
  public getCurrentUserId(): number | undefined {
    return this.currentUserSubject.value?.id;
  }
  public getAllUsers(): Observable<IUser[]> {
    return this.http
      .get<IUser[]>(`${this.apiUrl}/users`)
      .pipe(catchError(this.handleError('Failed to fetch users')));
  }

  public getUserById(userId: string | number): Observable<IUser> {
    return this.http
      .get<IUser>(`${this.apiUrl}/users/${userId}`)
      .pipe(catchError(this.handleError('Failed to fetch user details')));
  }

  public updateUser(
    userId: string | number,
    userData: Partial<IUser>
  ): Observable<IUser> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.id !== userId && !currentUser.isAdmin)) {
      return throwError(
        () => new Error('You do not have permission to edit this user')
      );
    }

    if (userData.email && userData.email !== currentUser.email) {
      return this.CheckDataUniqueService.checkEmailUnique(userData.email).pipe(
        switchMap((exists) => {
          if (exists) {
            return throwError(() => new Error('Email is already in use'));
          }
          return this.performUpdate(userId, userData);
        })
      );
    }

    return this.performUpdate(userId, userData);
  }
  public isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  private isAdmin(): boolean {
    return !!this.currentUserSubject.value?.isAdmin;
  }

  private setCurrentUser(user: IUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private userFromStorage(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.currentUserSubject.next(JSON.parse(currentUser));
    }
  }

  // private checkEmailExists(email: string): Observable<boolean> {
  //   return this.http.get<IUser[]>(`${this.apiUrl}/users?email=${email}`).pipe(
  //     map((users) => users.length > 0),
  //     catchError(this.handleError('Unable to verify email'))
  //   );
  // }
  private performUpdate(
    userId: string | number,
    userData: Partial<IUser>
  ): Observable<IUser> {
    return this.http
      .patch<IUser>(`${this.apiUrl}/users/${userId}`, userData)
      .pipe(
        tap((updatedUser) => {
          const currentUser = this.getCurrentUser();
          if (currentUser?.id === updatedUser.id) {
            const { password, ...userWithoutPassword } = updatedUser;
            this.setCurrentUser(userWithoutPassword);
          }
        }),
        catchError(this.handleError('Failed to update user'))
      );
  }

  private handleError(message: string) {
    return (error: HttpErrorResponse | Error) => {
      const errorMessage =
        error instanceof HttpErrorResponse
          ? error.error?.message || error.message || message
          : error.message || message;

      console.error('Auth service error:', error);
      return throwError(() => new Error(errorMessage));
    };
  }
}
