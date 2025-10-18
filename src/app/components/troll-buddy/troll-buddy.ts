import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { NotificationService } from '../../services/notification';
import { MatButtonModule } from '@angular/material/button';
import { Button } from '../ui/components/ui/button/button';

@Component({
  selector: 'app-troll-buddy',
  imports: [MatButtonModule, Button],
  templateUrl: './troll-buddy.html',
  styleUrl: './troll-buddy.scss',
  standalone: true
})
export class TrollBuddy implements AfterViewInit, OnDestroy {


  private readonly notificationService = inject(NotificationService);
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;

  stream: MediaStream | null = null;
  capturedImages: string[] = [];
  intervalId: any;

  ngAfterViewInit() {
    this.requestCameraAccess();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async requestCameraAccess() {
    console.log('requestCameraAccess called');
    try {
      console.log('Requesting camera access...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true // Any available camera
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.startCapturing();
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.notificationService.showError('Kamera-Zugriff verweigert oder nicht unterstützt.');
      this.startMockCapturing();
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

  startMockCapturing() {
    this.intervalId = setInterval(() => {
      this.captureMockImage();
    }, 5000); // Every 5 seconds
  }

  captureMockImage() {
    // Generate a random colored rectangle as mock image
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = 320;
      canvas.height = 240;
      context.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'white';
      context.font = '20px Arial';
      context.fillText('Mock Image', 10, 30);
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
}
