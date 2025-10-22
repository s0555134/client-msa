import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../environments/environment';

interface VisionResponse {
  responses: {
    safeSearchAnnotation: {
      adult: string;
      spoof: string;
      medical: string;
      violence: string;
      racy: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ImageModerationService {
  private apiKey = environment.googleVisionApiKey;

  constructor(private apiService: ApiService) {}

  async moderateImage(base64Image: string): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Google Vision API key not configured. Skipping moderation.');
      return true; // Allow if no key
    }

    const url = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;

    const body = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1] // Remove data:image/png;base64, prefix
          },
          features: [
            {
              type: 'SAFE_SEARCH_DETECTION'
            }
          ]
        }
      ]
    };

    try {
      const response = await this.apiService.post<VisionResponse>(url, body).toPromise();
      if (response && response.responses && response.responses[0]) {
        const safeSearch = response.responses[0].safeSearchAnnotation;
        // Block if adult, violence, or racy is LIKELY or VERY_LIKELY
        const blockLevels = ['LIKELY', 'VERY_LIKELY'];
        if (blockLevels.includes(safeSearch.adult) || blockLevels.includes(safeSearch.violence) || blockLevels.includes(safeSearch.racy)) {
          return false; // Block
        }
      }
      return true; // Allow
    } catch (error) {
      console.error('Error moderating image:', error);
      return true; // Allow on error to avoid blocking legitimate images
    }
  }
}
