import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { Button } from '../../../ui/components/ui/button/button';

@Component({
  selector: 'app-session-qr',
  imports: [QRCodeComponent, MatCardModule, MatIcon, ClipboardModule, Button],
  templateUrl: './session-qr.html',
  styleUrls: ['./session-qr.scss'],
  standalone: true
})
export class SessionQrComponent {
  @Input() link = '';
  @Input() showQrCode = false;
  @Output() startNewSession = new EventEmitter<void>();

  onStartNewSession() {
    this.startNewSession.emit();
  }
}
