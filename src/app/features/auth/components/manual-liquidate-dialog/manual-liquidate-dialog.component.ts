import {Component, ChangeDetectionStrategy, Inject, OnInit} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-manual-liquidate-dialog',
  templateUrl: './manual-liquidate-dialog.component.html',
  styleUrls: ['./manual-liquidate-dialog.component.css'],
  imports: [MatCardModule, MatChipsModule, MatProgressBarModule, MatFormField, MatLabel, MatInput, MatError, MatSelectModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualLiquidateDialogComponent implements OnInit {

  paymentMethodControl = new FormControl('', Validators.required);
  availableMethods: { value: string, label: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<ManualLiquidateDialogComponent>,
    private readonly http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    const methodsMap = [
      {key: 'pix', value: 'pix', label: 'PIX'},
      {key: 'boleto', value: 'boleto', label: 'Boleto'},
      {key: 'creditCard', value: 'credit_card', label: 'Cartão de Crédito'},
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

  confirm() {
    if (this.paymentMethodControl.invalid) {
      this.paymentMethodControl.markAsTouched();
      return;
    }

    const url = `${environment.apiUrl}/invoice/manual-liquidate`;
    const payload = {
      invoiceId: this.data._id,
      paymentMethod: this.paymentMethodControl.value,
      paidValue: this.data.totalValue,
      paidDate: new Date().toISOString(),
    };

    this.http.post<any>(url, payload).subscribe({
      next: (data) => {
        this.dialogRef.close(data);
      },
      error: (err) => {
        console.error('Error creating invoice', err);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

}
