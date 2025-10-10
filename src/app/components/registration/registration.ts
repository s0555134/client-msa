import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Button } from "../ui/components/ui/button/button";
import { NotificationService } from "../../services/notification";

@Component({
  selector: 'app-registration',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, Button],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
  standalone: true,
})
export class Registration {
  registrationForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  isLoading = signal<boolean>(false);

  constructor(private notificationService: NotificationService) {}

  async onSubmit() {
    if (this.registrationForm.valid) {
      const { username, email, password } = this.registrationForm.value;
      try {
        this.isLoading.set(true);
        const userCredential = await createUserWithEmailAndPassword(getAuth(), email!, password!);
        await updateProfile(userCredential.user, { displayName: username! });
        console.log('User registered successfully:', userCredential.user);
        this.notificationService.showSuccess('User registered successfully');
      } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed';
        if (error instanceof Error) {
          if (error.message.includes('email-already-in-use')) {
            errorMessage = 'This email is already in use. Please try logging in instead.';
          } else if (error.message.includes('weak-password')) {
            errorMessage = 'Password is too weak. Please choose a stronger password.';
          } else if (error.message.includes('invalid-email')) {
            errorMessage = 'Invalid email address.';
          } else if (error.message.includes('network-request-failed')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          }
        }
        this.notificationService.showError(errorMessage);
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}
