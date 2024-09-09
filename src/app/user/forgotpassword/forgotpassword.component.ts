import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css',
  
  imports: [FormsModule, CommonModule, RouterLink, RouterModule ] 
})
export class ForgotpasswordComponent {

   email = '';
   errorMessage = '';

   constructor(private authService: AuthService) {}

   async sendPasswordResetEmail() {
    try {
      await this.authService.forgotPassword(this.email);
      // Handle success, e.g., show a success message
      this.errorMessage = 'Password reset email sent successfully';
    } catch (error: any) {
      // Handle error, e.g., show an error message
      this.errorMessage = error.message;
    }
  }
}
