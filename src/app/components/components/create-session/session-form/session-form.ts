import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Button } from '../../../ui/components/ui/button/button';

@Component({
  selector: 'app-session-form',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, Button],
  templateUrl: './session-form.html',
  styleUrls: ['./session-form.scss'],
  standalone: true
})
export class SessionFormComponent {
  @Input() form!: FormGroup;
  @Input() existingSession = false;
  @Output() onSubmit = new EventEmitter<void>();

  submitForm() {
    this.onSubmit.emit();
  }
}
