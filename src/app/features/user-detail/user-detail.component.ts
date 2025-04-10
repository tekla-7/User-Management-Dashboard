import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
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
import { CommonModule } from '@angular/common';
import { IUser } from '../../core/models/user.model';
import { SharedService } from '../../shared/services/shared-services/shared.service';
import { tap } from 'rxjs';
import { RadioButton } from 'primeng/radiobutton';
import { HttpClient } from '@angular/common/http';

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
    RadioButton,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  public id = input.required<string | number>();
  public isEditing = signal<boolean>(true);
  private userInfo = signal<IUser>({
    name: '',
    email: '',
    id: 0,
    password: '',
    isAdmin: false,
  });
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sharedService = inject(SharedService);
  public isAdmin = signal<boolean>(true);
  public userAccess = signal<boolean>(false);
  private currentLoginUser = signal<IUser | null>(
    this.authService.getCurrentUser()
  );
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
  public toggleEditState(action: string): void {
    this.isEditing.update((el) => !el);
    this.isEditing() ? this.setDisable() : this.setEnable();
    action === 'cancel' && this.cancel();
    action === 'delate' && this.delate();
    action === 'save' && this.save();
  }
  private cancel(): void {
    this.userForm.reset();
    this.setUserForm(this.userInfo());
  }
  private delate(): void {
    if (!this.userInfo().id) {
      return;
    }

    this.authService
      .delateUser(this.userInfo().id?.toString())
      .pipe(
        tap((user) => {
          if (user) {
            if (this.currentLoginUser()?.id !== this.id() && this.isAdmin()) {
              this.router.navigate(['/users']);
            } else if (this.userInfo().id === this.id()) {
              this.authService.logout();
              this.router.navigate(['/login']);
            }
          }
        })
      )
      .subscribe();
  }
  private save(): void {
    let formAdminChange = this.role.value.name == 'admin' ? true : false;
    let updateUser: Partial<IUser> = {
      id: this.userInfo().id,
    };
    this.name.value !== this.userInfo().name &&
      (updateUser.name = this.name.value ?? undefined);
    this.email.value !== this.userInfo().email &&
      (updateUser.email = this.email.value ?? undefined);
    this.password.value !== this.userInfo().password &&
      (updateUser.password = this.password.value ?? undefined);
    formAdminChange !== this.userInfo().isAdmin &&
      (updateUser.isAdmin = formAdminChange);
    if (
      this.name.value !== this.userInfo().name ||
      this.password.value !== this.userInfo().password ||
      this.email.value !== this.userInfo().email ||
      formAdminChange !== this.userInfo().isAdmin
    ) {
      this.authService
        .updateUser(updateUser)
        .pipe(
          tap((user) => {
            if (user) {
              this.setUserInfoValue(user);
              console.log('this is update', this.userInfo());
            }
          })
        )
        .subscribe((el) => console.log('this is update', el));
    }
  }
  private checkAdmin() {
    this.isAdmin.set(this.authService.isAdmin());
  }
  private checkUserAccess() {
    let currentUserId = this.authService.getCurrentUserId();
    if (this.isAdmin()) {
      currentUserId?.toString() === this.id() && this.userAccess.set(true);
      return;
    }
    currentUserId?.toString() === this.id()
      ? this.userAccess.set(true)
      : this.userAccess.set(false);
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
  private setUserForm(user: IUser) {
    if (!user.name || !user.email || !user.password) {
      return;
    }

    this.userForm.setValue({
      name: user.name,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
      role: user.isAdmin ? this.roles[0] : this.roles[1],
    });
  }
  private setUserInfo() {
    this.authService.getUserById(this.id()).subscribe((users) => {
      let user: IUser = users[0];
      if (!user.name || !user.email || !user.id || !user.password) {
        return;
      }
      this.setUserInfoValue(user);
      this.setUserForm(user);
    });
  }
  private setUserInfoValue(user: IUser): void {
    this.userInfo.set({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      isAdmin: user.isAdmin,
    });
  }
  private checkIfUserValueExists(user: IUser): boolean {
    return !!(user?.name && user?.email && user?.id && user?.password);
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
  get role() {
    return this.userForm.controls['role'];
  }
  get confirmPassword() {
    return this.userForm.controls['confirmPassword'];
  }
}
