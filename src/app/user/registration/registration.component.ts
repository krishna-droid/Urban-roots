import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],

  standalone: true, // Mark the component as standalone
  imports: [FormsModule, CommonModule, RouterLink, RouterModule] // Import FormsModule
})
export class RegistrationComponent implements OnInit {
  email = '';
  password  = '';
  confirmPassword = '';
  name = '';
  error: string | null = null;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  }

  async signup() {
    if (this.email && this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    try {
      console.log('email',this.email);
      
      await this.authService.signup(this.email, this.password, this.name);
      // Handle successful signup, e.g., redirect to login or dashboard
      this.router.navigate(['/user/dashboard']);
    } catch (error: any) {
      this.error = error.message;
    }
  }

}
