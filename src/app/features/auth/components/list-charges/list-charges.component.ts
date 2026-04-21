import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {finalize} from 'rxjs';

import {CreateChargeDialogComponent} from '../create-charge-dialog/create-charge-dialog.component';
import {ManualLiquidateDialogComponent} from '../manual-liquidate-dialog/manual-liquidate-dialog.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import {ReactiveFormsModule, FormGroup, FormControl} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Router} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-list-charges',
  templateUrl: './list-charges.component.html',
  styleUrls: ['./list-charges.component.css'],
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
    NgClass,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListChargesComponent implements OnInit {
  displayedColumns: string[] = ['position', 'client', 'status', 'totalValue', 'createdAt', 'actions'];
  dataSource: any[] = [];
  isLoading = false;

  statusMap: Record<string, string> = {
    canceled: 'Cancelado',
    waitingPayment: 'Aguardando pagamento',
    paid: 'Pago'
  };

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl(null)
  });

  constructor(
    private readonly http: HttpClient,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.getList();
  }

  search(): void {
    this.getList(this.filterForm.value);
  }

  openCreateChargeDialog(): void {
    this.dialog.open(CreateChargeDialogComponent, {
      width: '600px',
    });
  }

  openManualLiquidateDialog(charge: any): void {
    this.dialog.open(ManualLiquidateDialogComponent, {
      width: '600px',
      data: charge
    });
  }

  openCheckout(url: any): void {
    window.open(url, '_blank');
  }

  getList(filters: any = {}): void {
    this.isLoading = true;

    const url = `${environment.apiUrl}/invoice`;
    const userIdLogged = localStorage.getItem('user_id');

    let params = new HttpParams()
      .set('sortOrder', 'DESC')
      .set('sortField', 'createdAt')
      .set('referenceId', userIdLogged ?? '');

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    this.http.get<any>(url, {params}).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => {
        this.dataSource = data?.results ?? [];
      },
      error: () => {
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.statusMap[status] ?? status;
  }
}
