import { Component, EventEmitter, Input, output, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-button',
  imports: [MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  standalone: true
})
export class Button {
  @Input() loading = false;
  @Input() text = 'Submit';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  buttonClicked = output<void>();

  onClick() {
    console.log('Button onClick called, loading:', this.loading);
    if (!this.loading) {
      console.log('Emitting clicked event');
      this.buttonClicked.emit();
    } else {
      console.log('Button is loading, not emitting');
    }
  }
}
