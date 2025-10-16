import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { Auth, authState, signOut, User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header implements OnInit, OnDestroy {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private subscription: Subscription = new Subscription();

  user = signal<User | null>(null);

  ngOnInit() {
    this.subscription = authState(this.auth).subscribe(user => {
      this.user.set(user);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.notificationService.showSuccess('Erfolgreich ausgeloggt!');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.notificationService.showError('Logout fehlgeschlagen: ' + error.message);
    }
  }
}
