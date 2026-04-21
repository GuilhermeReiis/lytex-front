import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {TokenService} from '../../../../core/services/token.service';
import {Router} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
})
export class HeaderComponent {
  constructor(private readonly tokenService: TokenService, private readonly router: Router) {
  }

  logout() {
    this.tokenService.remove()
    this.router.navigate(['/login'])
  }
}
