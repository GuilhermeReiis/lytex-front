import {Component, ChangeDetectionStrategy, Inject, OnInit, ChangeDetectorRef} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-manual-liquidate-dialog',
  templateUrl: './manual-liquidate-dialog.component.html',
  styleUrls: ['./manual-liquidate-dialog.component.css'],
  imports: [
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualLiquidateDialogComponent implements OnInit {

  paymentMethodControl = new FormControl('', Validators.required);
  availableMethods: { value: string, label: string }[] = [];
  isLoading = false;

  constructor(
    private readonly dialogRef: MatDialogRef<ManualLiquidateDialogComponent>,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    const methodsMap = [
      {key: 'pix', value: 'pix', label: 'PIX'},
      {key: 'boleto', value: 'boleto', label: 'Boleto'},
      {key: 'creditCard', value: 'creditCard', label: 'Cartão de Crédito'},
    ];

    const paymentMethods = this.data?.paymentMethods;

    if (!paymentMethods) return;

    this.availableMethods = methodsMap
      .filter(method => paymentMethods[method.key]?.enable)
      .map(method => ({
        value: method.value,
        label: method.label,
      }));
  }

  confirm(): void {
    if (this.paymentMethodControl.invalid) {
      this.paymentMethodControl.markAsTouched();
      return;
    }

    this.liquidateInvoice();
  }

  private liquidateInvoice(): void {
    this.isLoading = true;

    const url = `${environment.apiUrl}/invoice/manual-liquidate`;
    const payload = {
      invoiceId: this.data._id,
      paymentMethod: this.paymentMethodControl.value,
      paidValue: this.data.totalValue,
    };

    this.http.post<any>(url, payload).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => this.dialogRef.close(data),
      error: (err) => {
        this.close()
        Swal.fire({
          title: 'Erro',
          text: err?.error?.message ?? 'Erro ao liquidar cobrança',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
