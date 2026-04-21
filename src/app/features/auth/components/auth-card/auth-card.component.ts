import {Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-auth-card',
  templateUrl: './auth-card.component.html',
  styleUrls: ['./auth-card.component.css'],
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
  ],
})
export class AuthCardComponent {
}
