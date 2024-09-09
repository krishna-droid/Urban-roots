import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { ForumService } from '../forum.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  standalone: true,
  imports: [RouterLink,RouterModule, FormsModule, CommonModule]
})
export class ForumOverviewComponent implements OnInit {

  topics: any[] = [];
  open = false;
  constructor(private forumService: ForumService, private authService: AuthService) { }

  ngOnInit() {
    this.fetchTopics();
  }

  async fetchTopics() {
    this.topics = await this.forumService.getAllTopics();
  }

  logout() {
    this.authService.logout();   
  }

}
