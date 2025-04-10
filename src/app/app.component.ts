import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth-service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  // constructor(){
    
  //   this.authService.logout();
  // }
  // ngOnInit(): void {
  //   window.addEventListener('beforeunload', () => {
  //     this.authService.logout();
  //   }, false);
  // }
 
}
