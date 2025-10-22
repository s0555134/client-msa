import { Component, inject, OnInit, signal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { NotificationService } from '../../../services/notification';
import { FirebaseService } from '../../../services/firebase.service';
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
export class CreateSession implements OnInit {
  private readonly auth = inject(Auth);
  private readonly firebaseService = inject(FirebaseService);
  userId: string = '';
  sessionId: string = '';
  sessionKey: string | null = null; // Firebase key for the session
  link: string = '';
  showQrCode = signal(false);
  capturedImages = signal<string[]>([]);
  existingSession = signal(false);
  defaultYtLinkId = "p3s19nI1NA"

  form: FormGroup;

  constructor(private readonly notificationService: NotificationService, private readonly fb: FormBuilder) {
    this.setUserAndSession();
    this.form = this.fb.group({
      name: ['', Validators.required],
      jahr: ['', Validators.required],
      youtubeLink: ['', this.youtubeLinkValidator],
    });
  }
   ngOnInit(): void {
     this.checkExistingSession();
  }

  private youtubeLinkValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // Optional field
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
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
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  private isYouTubeShorts(url: string): boolean {
    return url.includes('shorts/');
  }

  async createSession() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.get('name')?.value;
    const jahr = Number(this.form.get('jahr')?.value);
    const youtubeLink = this.form.get('youtubeLink')?.value;
    const youtubeVideoId = youtubeLink ? this.extractYouTubeVideoId(youtubeLink) : this.defaultYtLinkId;
    this.setUserAndSession(); // Refresh userId and sessionId on each session creation
    const sessionData = {
      sessionId: this.sessionId,
      userId: this.userId,
      name: name,
      age: jahr,
      youtubeVideoId: youtubeVideoId
    };

    this.sessionKey = await this.firebaseService.push('sessions', sessionData);
    if (this.sessionKey) {
      console.log('Session created successfully:', sessionData);
      this.notificationService.showSuccess('Qr Code erfolgreich erstellt!');
      this.link = `${environment.baseUrl}/troll-buddy/${this.userId}/${this.sessionId}`;
      this.showQrCode.set(true);
     // this.loadCapturedImages(); // Load images after session creation
    } else {
      this.notificationService.showError('Qr konnte nicht erstellt werden!');
      this.showQrCode.set(false);
    }
  }

  private async loadCapturedImages() {
    if (!this.sessionKey) return; // Use sessionKey instead of sessionId
    try {
      const images = await this.firebaseService.get(`sessions/${this.userId}/${this.sessionKey}/images`);
      if (images) {
        const imageUrls = Object.values(images) as string[];
        // Sort by timestamp (assuming keys are timestamps)
        const sortedImages = imageUrls.sort((a, b) => {
          const aTimestamp = parseInt(Object.keys(images).find(key => images[key] === a) || '0');
          const bTimestamp = parseInt(Object.keys(images).find(key => images[key] === b) || '0');
          return bTimestamp - aTimestamp; // Latest first
        });
        this.capturedImages.set(sortedImages.slice(0, 10)); // Keep only latest 10
        console.log('Loaded captured images:', this.capturedImages().length);
      } else {
        console.log('No images found for session:', this.sessionKey);
      }
    } catch (error) {
      console.error('Error loading captured images:', error);
    }
  }

  private async checkExistingSession() {
    const user = this.auth.currentUser;
    if (!user) return;

    const sessionKey = await this.firebaseService.getSessionKeyByUserId(user.uid);
    if (sessionKey) {
      const sessions = await this.firebaseService.get('sessions');
      if (sessions) {
        this.sessionId = sessions[sessionKey].sessionId;
        this.link = `${environment.baseUrl}/troll-buddy/${this.userId}/${this.sessionId}`;
        this.showQrCode.set(true);
        this.existingSession.set(true);
      }
    }
  }

  async startNewSession() {
    const user = this.auth.currentUser;
    if (user) {
      const sessionKey = await this.firebaseService.getSessionKeyByUserId(user.uid);
      if (sessionKey) {
        await this.firebaseService.remove(`sessions/${sessionKey}`);
        console.log('Session deleted successfully');
      }
    }
    this.resetSessionData();
  }

  resetSessionData() {
     this.showQrCode.set(false);
    this.capturedImages.set([]);
    this.sessionKey = null;
    this.sessionId = '';
    this.link = '';
    this.existingSession.set(false);
    this.form.reset();
    this.setUserAndSession();
  }
}
