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
import { Router } from '@angular/router';

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
import { takeUntil, tap } from 'rxjs';
import { RadioButton } from 'primeng/radiobutton';
import { NotificationComponentComponent } from '../../shared/components/notification-component/notification-component.component';
import { Destroyable } from '../../shared/base/classes/destroyable.class';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    Message,
    CommonModule,
    RadioButton,
    NotificationComponentComponent,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent extends Destroyable implements OnInit {
  public id = input.required<string | number>();
  public isEditing = signal<boolean>(true);
  private userInfo = signal<IUser>({
    name: '',
    email: '',
    id: '',
    password: '',
    isAdmin: false,
  });

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sharedService = inject(SharedService);
  public isAdmin = signal<boolean>(true);
  public userAccess = signal<boolean>(false);
  private currentLoginUser = signal<IUser | null>(
    this.authService.getCurrentUser()
  );

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

  public roles: { name: string; key: string }[] = [
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
      .pipe(takeUntil(this.destroyed$))
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
        }),
        takeUntil(this.destroyed$)
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
          }),
          takeUntil(this.destroyed$)
        )
        .subscribe({
          next: (response) => {
            if (
              updateUser.isAdmin !== undefined &&
              updateUser.id == this.currentLoginUser()?.id
            ) {
              this.authService.setCurrentUser(response);
              response.isAdmin !== undefined &&
                this.isAdmin.set(response.isAdmin);
            }
            this.severity.set('success');
            this.message.set('update successful!');
          },
          error: (err) => {
            this.severity.set('error');
            this.message.set('update failed' + err);
            console.error('update failed:', err);
          },
        });
    }
  }
  private checkAdmin() :void{
    this.isAdmin.set(this.authService.isAdmin());
  }
  private checkUserAccess() :void{
    let currentUserId = this.authService.getCurrentUserId();
    if (this.isAdmin()) {
      currentUserId?.toString() === this.id() && this.userAccess.set(true);
      return;
    }
    currentUserId?.toString() === this.id()
      ? this.userAccess.set(true)
      : this.userAccess.set(false);
  }
  private setDisable() :void{
    this.userForm.get('name')?.disable();
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.disable();
    this.userForm.get('confirmPassword')?.disable();
    this.userForm.get('role')?.disable();
  }
  private setEnable():void {
    this.userForm.get('name')?.enable();
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();
    if (this.isAdmin()) {
      this.userForm.get('role')?.enable();
    }
  }
  private setUserForm(user: IUser):void {
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
  private setUserInfo():void {
    this.authService
      .getUserById(this.id())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((users) => {
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
