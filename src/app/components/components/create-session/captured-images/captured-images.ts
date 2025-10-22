import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-captured-images',
  imports: [MatCardModule],
  templateUrl: './captured-images.html',
  styleUrls: ['./captured-images.scss'],
  standalone: true
})
export class CapturedImagesComponent {
  @Input() capturedImages: string[] = [];
}
