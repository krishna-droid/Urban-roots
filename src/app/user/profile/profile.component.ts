import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { updateProfile, User } from '@angular/fire/auth';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true, // Mark the component as standalone
  imports: [FormsModule, CommonModule, RouterLink, RouterModule ] // Import FormsModule
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  username: string | null = null;
  email: string | null = null;
  profileImageUrl: string | null = null;
  isEditingUsername = false;
  newUsername: string = '';
  open = false;
  
  constructor(private authService: AuthService, private storage: Storage) {}

  ngOnInit() {
    this.authService.getCurrentUser()
    .then(async (user: User | null) => { // Use 'async' here
      if (user) {
        this.username = user.displayName;
        this.email = user.email;
        this.profileImageUrl = await this.authService.fetchProfileImageUrl();
      } else {
        // Handle the case where the user is null
        console.error('User not authenticated.');
        // this.router.navigate(['/login']); 
      }
    });
  }

  selectProfileImage() {
    this.fileInput.nativeElement.click();
  }

  async onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        const downloadURL = await this.authService.uploadProfileImage(file);
        this.profileImageUrl = downloadURL;
        await this.authService.updateProfileImageUrlInFirestore(downloadURL); 
  
        const currentUser = await this.authService.getCurrentUser(); 
        if (currentUser) { 
          await updateProfile(currentUser, { photoURL: this.profileImageUrl });
        } else {
          console.error('User not authenticated. Cannot update profile image.');
        }
      } catch (error) {
        console.error('Error updating profile image:', error);
      }
    }
  }

  editUsername() {
    this.isEditingUsername = true;
    this.newUsername = this.username || '';
  }

  saveUsername() {
    if (this.newUsername) {
      this.authService.updateUsername(this.newUsername)
        .then(() => {
          this.username = this.newUsername;
          this.isEditingUsername = false;
        })
        .catch(error => {
          console.error('Error updating username:', error);
        });
    }
  }

  cancelEditUsername() {
    this.isEditingUsername = false;
    this.newUsername = '';
  }
  
  logout() {
    this.authService.logout();   
  }
}