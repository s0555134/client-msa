import { Component, inject, signal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { getDatabase, ref, push } from '@angular/fire/database';
import { NotificationService } from '../../../services/notification';
import { Auth } from '@angular/fire/auth';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../ui/components/ui/button/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-create-session',
  imports: [QRCodeComponent, Button, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, ClipboardModule],
  templateUrl: './create-session.html',
  styleUrls: ['./create-session.scss'],
  standalone: true
})
export class CreateSession {
  private readonly auth = inject(Auth);
  private readonly db = getDatabase();
  userId: string = '';
  sessionId: string = '';
  link: string = '';
  showQrCode = signal(false);

  form: FormGroup;

  constructor(private readonly notificationService: NotificationService, private readonly fb: FormBuilder) {
    this.setUserAndSession();
    this.form = this.fb.group({
      name: ['', Validators.required],
      jahr: ['', Validators.required],
      youtubeLink: ['', this.youtubeLinkValidator],
    });
  }

  private youtubeLinkValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // Optional field
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
    return youtubeRegex.test(value) ? null : { invalidYoutubeUrl: true };
  }

  private setUserAndSession() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
    } else {
      this.userId = 'unknown-user';
    }
    this.sessionId = uuidv4();
  }

  private extractYouTubeVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  createSession() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.get('name')?.value;
    const jahr = Number(this.form.get('jahr')?.value);
    const youtubeLink = this.form.get('youtubeLink')?.value;
    const youtubeVideoId = youtubeLink ? this.extractYouTubeVideoId(youtubeLink) : null;
    this.setUserAndSession(); // Refresh userId and sessionId on each session creation
    const sessionData = {
      sessionId: this.sessionId,
      name: name,
      age: jahr,
      youtubeVideoId: youtubeVideoId
    };

    // Save session data to Firebase using modular API
    const sessionsRef = ref(this.db, 'sessions');
    push(sessionsRef, sessionData).then(() => {
      console.log('Session created successfully:', sessionData);
      this.notificationService.showSuccess('Qr Code erfolgreich erstellt!');
      this.link = `${environment.baseUrl}/troll-buddy/${this.userId}/${this.sessionId}`;
      this.showQrCode.set(true);
    }).catch((error: any) => {
      console.error('Error creating session:', error);
      this.notificationService.showSuccess('Qr konnte nicht erstellt werden!');
      this.showQrCode.set(false);
    });
  }
}
