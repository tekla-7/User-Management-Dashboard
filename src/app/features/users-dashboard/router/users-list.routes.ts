import { Routes } from '@angular/router';
import { UsersListComponent } from '../../users-list-page/users-list.component';
import { UsersDashboardComponent } from '../component/users-dashboard.component';
import { UserDetailComponent } from '../../user-detail/user-detail.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersDashboardComponent,
    children: [
      { path: '', component: UsersListComponent },
      { path: 'user/:id', component: UserDetailComponent },
    ],
  },
];
