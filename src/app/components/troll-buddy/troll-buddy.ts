import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotificationService } from '../../services/notification';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Button } from '../ui/components/ui/button/button';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { environment } from '../../environments/environment'; // Import environment
import { getDatabase, ref, get } from '@angular/fire/database';

@Component({
  selector: 'app-troll-buddy',
  imports: [MatButtonModule, MatCardModule, Button],
  templateUrl: './troll-buddy.html',
  styleUrl: './troll-buddy.scss',
  standalone: true
})
export class TrollBuddy implements AfterViewInit, OnDestroy, OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute); // Inject ActivatedRoute
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  stream: MediaStream | null = null;
  capturedImages: string[] = [];
  intervalId: any;

  userId: string | null = null; // To hold user ID
  sessionId: string | null = null; // To hold session ID
  userName = signal<string>(''); // To hold user name

  link: string | null = null; // To hold the dynamic link
  youtubeVideoId = signal<string | null>(null); // To hold YouTube video ID
  cameraGranted = signal<boolean>(false); // To track camera access

  ngAfterViewInit() {
    this.requestCameraAccess();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['userId']; // Retrieve user ID from route
      this.sessionId = params['sessionId']; // Retrieve session ID from route
      // Build the dynamic link using environment.baseUrl
      if (this.userId && this.sessionId) {
        this.link = `${environment.baseUrl}/troll-buddy/${this.userId}/${this.sessionId}`;
        this.fetchSessionData();
      }
    });
  }

  private async fetchSessionData() {
    if (!this.userId || !this.sessionId) return;
    const db = getDatabase();
    const sessionsRef = ref(db, 'sessions');
    try {
      const snapshot = await get(sessionsRef);
      if (snapshot.exists()) {
        const sessions = snapshot.val();
        // Find the session by sessionId
        for (const key in sessions) {
          if (sessions[key].sessionId === this.sessionId) {
            this.youtubeVideoId.set(sessions[key].youtubeVideoId || null);
            this.userName.set(sessions[key].name || '');
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async requestCameraAccess() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true // Any available camera
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.cameraGranted.set(true);
      this.startCapturing();
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.notificationService.showError('Zugriff verweigert oder nicht unterstützt.');
      this.cameraGranted.set(false);
    }
  }

  startCapturing() {
    this.intervalId = setInterval(() => {
      this.captureImage();
    }, 5000); // Every 5 seconds
  }

  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      this.capturedImages.unshift(imageDataUrl); // Add to beginning
      if (this.capturedImages.length > 10) { // Keep only last 10 images
        this.capturedImages.pop();
      }
    }
  }



  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getSafeUrl(videoId: string | null): SafeResourceUrl {
   return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`);
   }
}
