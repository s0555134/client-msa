import { Component } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";

@Component({
  selector: 'app-footer',
  imports: [MatToolbar],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer {
    currentYear = new Date().getFullYear();
}
