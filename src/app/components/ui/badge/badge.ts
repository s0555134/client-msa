import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationState } from '../../../services/notification';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './badge.html',
  styleUrl: './badge.scss'
})
export class BadgeComponent implements OnInit, OnDestroy {
  notification = signal<NotificationState>({ show: false, message: '', type: 'success' });
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(state => {
      this.notification.set(state);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  close() {
    this.notificationService.hide();
  }
}
