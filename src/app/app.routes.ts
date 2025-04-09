import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/component/register.component';
import { authGuard } from './core/guards/auth-guard/auth.guard';
import { loginGuard } from './core/guards/login-guard/login.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users-dashboard/router/users-list.routes').then(
        (mod) => mod.USERS_ROUTES
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadChildren: () =>
      import('./features/page-not-found/router/users-list.routes').then(
        (mod) => mod.PAGE_NOT_FOUND
      ),
  },
];
