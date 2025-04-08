import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { PasswordModule } from 'primeng/password';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';
import { Message } from 'primeng/message';
import { NotificationComponentComponent } from '../../../shared/components/notification-component/notification-component.component';
import { SeverityType } from '../../../shared/models/severity-type.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    Message,
    NotificationComponentComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router=inject(Router)
  message = signal<string>('');
  severity=signal<SeverityType>('error')
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  public submit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    if (!email || !password) {
      return;
    }
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.severity.set('success')
        this.message.set('login successful!');
        this.router.navigate(['/users']);
        console.log('login successful!', response);
      },
      error: (err) => {
        this.severity.set('error')
        this.message.set('login failed' + err);
        console.error('login failed:', err);
      },
    });
  }
  public onClose(): void {
    this.message.set('');
  }
  get email() {
    return this.loginForm.controls['email'];
  }
  get password() {
    return this.loginForm.controls['password'];
  }
}
