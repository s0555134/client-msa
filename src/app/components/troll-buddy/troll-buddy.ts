import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-troll-buddy',
  imports: [],
  templateUrl: './troll-buddy.html',
  styleUrl: './troll-buddy.scss',
  standalone: true
})
export class TrollBuddy implements AfterViewInit, OnDestroy {
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
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // Front camera
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.startCapturing();
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not supported.');
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
}
