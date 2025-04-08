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
  // host: {
  //   '(click[$event])': 'close()',
  // },
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  public isDropdownOpen = signal<boolean>(false);
  public isMenuOpen = signal<boolean>(false);
  public currentUserId = signal<number | undefined>(undefined);
  ngOnInit(): void {
    this.currentUserId.set(this.authService.getCurrentUserId());
    console.log(this.currentUserId());
  }

  public toggleDropdown(): void {
    this.isDropdownOpen.update((el) => !el);
  }
  public toggleMobileMenu(): void {
    this.isMenuOpen.update((el) => !el);
  }
  public closeMobileMenu(): void {
    this.isMenuOpen.set(false);
  }
  public signOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  @HostListener('document:click', ['$event'])
  private close(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.dropDown');
    if (!clickedInside) {
      this.isDropdownOpen.set(false);
    }
  }
}
