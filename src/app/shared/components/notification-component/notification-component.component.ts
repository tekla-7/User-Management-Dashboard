import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
} from '@angular/core';
import { Message } from 'primeng/message';
import { SeverityType } from '../../models/severity-type.model';

@Component({
  selector: 'app-notification-component',
  standalone: true,
  imports: [Message],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-component.component.html',
  styleUrl: './notification-component.component.scss',
})
export class NotificationComponentComponent implements OnInit {
  public message = input.required<string>();
  public severity = input.required<SeverityType>();
  public onClose = output<void>();
  ngOnInit(): void {
      setTimeout(() => {
        this.onClose.emit();
      }, 3000);
  }
  public handleClose():void {
    this.onClose.emit();
    
  }

}
