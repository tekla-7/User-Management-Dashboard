import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth-service/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AvatarModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);

  private readonly authService = inject(AuthService);
  public isDropdownOpen = signal<boolean>(false);
  public isMenuOpen = signal<boolean>(false);
  public currentUserId = signal<number | undefined | string>(undefined);
  ngOnInit(): void {
    this.currentUserId.set(this.authService.getCurrentUserId());
  }
  public userRoute() {
    let url = this.router.url;

    if (!url.includes('user/')) {
      this.router.navigate(['/users/user', this.currentUserId()]);
    }
  }
  public toggleDropdown(): void {
    this.isDropdownOpen.update((el) => !el);
  }
  public toggleMobileMenu(): void {
    this.isMenuOpen.update((el) => !el);
  }
  public closeMobileMenu(value: string): void {
    this.isMenuOpen.set(false);
    if (value == 'user') {
      this.userRoute();
    }
  }
  public signOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  @HostListener('document:click', ['$event'])
  close(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.dropDown');
    if (!clickedInside) {
      this.isDropdownOpen.set(false);
    }
  }
}
