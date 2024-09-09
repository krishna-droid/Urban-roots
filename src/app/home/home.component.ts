import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule,
    RouterLink, RouterModule]
})
export class HomeComponent implements OnInit {

  constructor() { }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const image = document.getElementById('scrollImage') as HTMLImageElement;
    if (image) {
      // Change the scaling factor and max scale according to your needs
      const scrollPosition = window.scrollY;
      const maxScale = 1.2; // Maximum scale when scrolling
      const scale = 1 + Math.min(scrollPosition / 500, maxScale - 1); // Adjust scroll factor
      image.style.transform = `scale(${scale})`;
    }
  }


  ngOnInit(): void {
  }

}
