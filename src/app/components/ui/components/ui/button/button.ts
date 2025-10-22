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
  @Input() color: 'primary' | 'secondary' | 'accent' | 'warn' = 'primary';
  buttonClicked = output<void>();

  onClick() {
    if (!this.loading) {
      this.buttonClicked.emit();
    }
  }
}
