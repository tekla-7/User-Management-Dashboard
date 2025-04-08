import { Subject } from 'rxjs';
import { Directive, OnDestroy } from '@angular/core';

@Directive()
export abstract class Destroyable implements OnDestroy {
  private $destroyed = new Subject<void>();
  protected destroyed$ = this.$destroyed.asObservable();

  public ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }
}
