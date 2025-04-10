import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TreeTableModule } from 'primeng/treetable';
import { AuthService } from '../../core/services/auth-service/auth.service';
import { Observable } from 'rxjs';
import { IUser } from '../../core/models/user.model';
import { Router } from '@angular/router';
@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [CommonModule, CardModule, TreeTableModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly autService = inject(AuthService);
  private readonly router = inject(Router);
  public users$: Observable<IUser[]> = this.autService.getAllUsers();
  public showUser(id: number | undefined|string): void {
    this.router.navigate(['users/user', id]);
  }
}
