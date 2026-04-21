import {MatTableModule} from '@angular/material/table';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {CreateChargeDialogComponent} from '../create-charge-dialog/create-charge-dialog.component';
import {MatDatepickerApply} from '@angular/material/datepicker';
import {ManualLiquidateDialogComponent} from '../manual-liquidate-dialog/manual-liquidate-dialog.component';

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
  ]
})
export class ListChargesComponent implements OnInit {
  displayedColumns: string[] = ['position', 'client', 'status', 'totalValue', 'createdAt', 'actions'];
  dataSource: any[] = []

  constructor(
    private readonly http: HttpClient,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.getList()
  }

  openCreateChargeDialog() {
    this.dialog.open(CreateChargeDialogComponent, {
      width: '600px',
    });
  }

  openManualLiquidateDialog(charge: any) {
    this.dialog.open(ManualLiquidateDialogComponent, {
      width: '600px',
      data: charge
    });
  }

  async getList(filters: any = {}) {
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

    this.http.get<any>(url, {params}).subscribe({
      next: (data) => {
        const results = data?.results ?? [];

        setTimeout(() => {
          this.dataSource = results;
          this.cdr.detectChanges();
        });
      },
      error: (erro) => {
        console.error('Erro ao listar faturas:', erro);
      }
    });
  }
}
