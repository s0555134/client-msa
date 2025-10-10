import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationState>({ show: false, message: '', type: 'success' });
  public notification$ = this.notificationSubject.asObservable();
  private hideTimeout: any;

  showSuccess(message: string) {
    this.clearTimeout();
    this.notificationSubject.next({ show: true, message, type: 'success' });
    this.hideTimeout = setTimeout(() => this.hide(), 5000);
  }

  showError(message: string) {
    this.clearTimeout();
    this.notificationSubject.next({ show: true, message, type: 'error' });
    this.hideTimeout = setTimeout(() => this.hide(), 5000);
  }

  hide() {
    this.clearTimeout();
    this.notificationSubject.next({ show: false, message: '', type: 'success' });
  }

  private clearTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}
