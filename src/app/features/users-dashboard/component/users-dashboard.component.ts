import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-users-dashboard',
  standalone:true,
  imports: [CommonModule ,RouterOutlet,HeaderComponent ,FooterComponent],
  templateUrl: './users-dashboard.component.html',
  styleUrl: './users-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class UsersDashboardComponent {

}
