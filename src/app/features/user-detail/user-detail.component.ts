import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { samePasswordValidator } from '../../core/auth/register/validators/same-password.validators';
import { emailAsyncValidator } from '../../shared/validators/check-email-uniqueness-validator';
import { Router, RouterLink } from '@angular/router';
import { CheckDataUniqueService } from '../../core/services/shared/check-data-unique.service';
import { AuthService } from '../../core/services/auth-service/auth.service';
import { SeverityType } from '../../shared/models/severity-type.model';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { CommonModule, formatNumber } from '@angular/common';
import { Checkbox } from 'primeng/checkbox';
import { IUser } from '../../core/models/user.model';
import { SharedService } from '../../shared/services/shared-services/shared.service';
import { tap } from 'rxjs';
import { RadioButton } from 'primeng/radiobutton';

@Component({
  selector: 'app-user-detail',
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
    Checkbox,
    RadioButton,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  public id = input.required<string | number>();
  public isEditing = signal<boolean>(true);
  private userInfo = signal<IUser | undefined>(undefined);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sharedService = inject(SharedService);
  public isAdmin = signal<boolean>(true);
  public userAccess = signal<boolean>(false);
  private readonly checkDataUniqueService = inject(CheckDataUniqueService);
  message = signal<string>('');
  severity = signal<SeverityType>('error');
  userForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z]+$/),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
      ]),

      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/),
        this.sharedService.checkpasswordUpperCase,
        this.sharedService.checkpasswordNumber,
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
      role: new FormControl(),
    },
    {
      validators: [samePasswordValidator('password', 'confirmPassword')],
    }
  );

  roles: any[] = [
    { name: 'admin', key: 'A' },
    { name: 'member', key: 'M' },
  ];

  ngOnInit(): void {
    this.setUserInfo();
    this.checkAdmin();
    this.checkUserAccess();
    this.setDisable();
    ///////need to be fix
    // this.userForm.controls['email'].valueChanges
    //   .pipe(
    //     tap((newEmail) => {
    //       const originalEmail = this.userInfo()?.email;

    //       if (newEmail !== originalEmail) {
    //         this.userForm.controls.email.setAsyncValidators(
    //           emailAsyncValidator(this.checkDataUniqueService)
    //         );
    //       } else {

    //         this.userForm.controls.email.clearAsyncValidators();
    //       }
    //     })
    //   )
    //   .subscribe();
  }
  public submit(): void {
    if (!this.userForm.valid) {
      return;
    }
    const { name, email, password } = this.userForm.value;
    if (!email || !password || !name) {
      return;
    }
    this.authService
      .register({ email: email, password: password, name: name })
      .subscribe({
        next: (response) => {
          this.severity.set('success');
          this.message.set('login successful!');
          this.router.navigate(['/users']);
          console.log('Registration successful!', response);
        },
        error: (err) => {
          this.severity.set('error');
          this.message.set('login failed' + err);
          console.error('Registration failed:', err);
        },
      });
  }
  public onClose(): void {
    this.message.set('');
  }
  public toggleEditState(): void {
    this.isEditing.update((el) => !el);
    if (!this.isEditing()) {
      this.setEnable();
    } else {
      this.setDisable();
    }
  }

  private checkAdmin() {
    this.isAdmin.set(this.authService.isAdmin());
  }
  private checkUserAccess() {
    if (this.isAdmin()) {
      return;
    }

    let currentUserId = this.authService.getCurrentUserId();

    if (currentUserId?.toString() === this.id()) {
      this.userAccess.set(true);
    } else {
      this.userAccess.set(false);
    }
  }
  private setDisable() {
    this.userForm.get('name')?.disable();
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.disable();
    this.userForm.get('confirmPassword')?.disable();
    this.userForm.get('role')?.disable();
  }
  private setEnable() {
    this.userForm.get('name')?.enable();
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();
    if (this.isAdmin()) {
      this.userForm.get('role')?.enable();
    }
  }
  private setUserInfo() {
    this.authService.getUserById(this.id()).subscribe((users) => {
      let user: IUser = users[0];
      if (!user.name || !user.email || !user.id || !user.password) {
        return;
      }
      this.userInfo.set({
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
      });

      this.userForm.setValue({
        name: user.name,
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
        role: user.isAdmin ? this.roles[0] : this.roles[1],
      });
    });
  }

  get name() {
    return this.userForm.controls['name'];
  }
  get email() {
    return this.userForm.controls['email'];
  }
  get password() {
    return this.userForm.controls['password'];
  }

  get confirmPassword() {
    return this.userForm.controls['confirmPassword'];
  }
}
