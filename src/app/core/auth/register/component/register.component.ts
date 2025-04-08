import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../services/auth-service/auth.service';
import { CardModule } from 'primeng/card';
import { samePasswordValidator } from '../validators/same-password.validators';
import { emailAsyncValidator } from '../../../../shared/validators/check-email-uniqueness-validator';
import { CheckDataUniqueService } from '../../../services/shared/check-data-unique.service';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/message';
import { NotificationComponentComponent } from '../../../../shared/components/notification-component/notification-component.component';
import { SeverityType } from '../../../../shared/models/severity-type.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    Message,
    CommonModule,
    NotificationComponentComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router=inject(Router)
  private readonly checkDataUniqueService = inject(CheckDataUniqueService);
  message = signal<string>('');
  severity=signal<SeverityType>('error')
  registerForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z]+$/),
      ]),
      email: new FormControl(
        '',
        [
          Validators.required,
          Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        ],
        [emailAsyncValidator(this.checkDataUniqueService)]
      ),

      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/),
        this.checkpasswordUpperCase,
        this.checkpasswordNumber,
        // Has at least one uppercase letter
        // Has at least one digit
        // Has at least one special character
        // Is at least 8 characters long
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:"\\\\|,.<>\\/?]).{8,}$'
        ),
      ]),
    },
    {
      validators: [samePasswordValidator('password', 'confirmPassword')],
    }
  );

  public submit(): void {
    if (!this.registerForm.valid) {
      return;
    }
    const { name,email, password } = this.registerForm.value;
    if(!email || !password||!name){
      return
    }
    this.authService
      .register({ email: email, password: password, name: name})
      .subscribe({
        next: (response) => {
          this.severity.set('success');
          this.message.set('login successful!');
          this.router.navigate(['/users']);
          console.log('Registration successful!', response);
        },
        error: (err) => {
          this.severity.set('error')
          this.message.set('login failed' + err);
          console.error('Registration failed:', err);
        },
      });
  }
  public onClose(): void {
    this.message.set('');
  }
  get name() {
    return this.registerForm.controls['name'];
  }
  get email() {
    return this.registerForm.controls['email'];
  }
  get password() {
    return this.registerForm.controls['password'];
  }

  get confirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }

  private checkpasswordUpperCase(
    control: AbstractControl
  ): null | { noUpperCase: { value: string } } {
    const hasUpperCase = /[A-Z]/.test(control.value);
    return hasUpperCase ? null : { noUpperCase: { value: control.value } };
  }

  private checkpasswordNumber(
    control: AbstractControl
  ): null | { noNumber: { value: number } } {
    const hasNumber = /\d/.test(control.value);
    return hasNumber ? null : { noNumber: { value: control.value } };
  }
}
