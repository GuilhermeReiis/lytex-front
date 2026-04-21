import {Component} from '@angular/core';
import {HeaderComponent} from '../../components/header/header.component';
import {ListChargesComponent} from '../../components/list-charges/list-charges.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    HeaderComponent,
    ListChargesComponent
  ]
})
export class DashboardComponent {
}
