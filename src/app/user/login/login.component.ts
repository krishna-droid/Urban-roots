import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

  standalone: true, // Mark the component as standalone
  imports: [FormsModule, CommonModule, RouterLink, RouterModule ] // Import FormsModule
})
export class LoginComponent {
  email = '';
  password = '';
  error: any;

  constructor(private authService: AuthService, private router: Router, private utils: UtilsService) {}

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/user/dashboard']); // Replace with your desired redirect
    } catch (error: any) {
      console.log('error', error);
      alert('invalid-credential')
      // this.utils.showError('invalid-credential');
      this.error = error.message;
    }
  }
}