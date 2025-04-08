import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-user-detail',
  standalone:true,
  imports: [],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  public isDropdownOpen = signal<boolean>(false);
  public id=input.required<any>()
ngOnInit(): void {
    console.log('this is rout id',this.id())
}}
