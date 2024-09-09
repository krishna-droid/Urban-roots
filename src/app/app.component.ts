import { Component,inject, OnInit  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  title = 'urbanroots';

  constructor() {
    
  }

  ngOnInit() {

  }
}
