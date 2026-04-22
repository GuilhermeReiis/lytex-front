import {ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  FormArray
} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {environment} from '../../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from 'rxjs';
import Swal from 'sweetalert2';

type PaymentMethod = 'pix' | 'ticket' | 'credit_card';

@Component({
  standalone: true,
  selector: 'app-create-charge-dialog',
  templateUrl: './create-charge-dialog.component.html',
  styleUrls: ['./create-charge-dialog.component.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconButton,
    MatIcon,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'}],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateChargeDialogComponent implements OnInit {
  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    {value: 'pix', label: 'PIX'},
    {value: 'ticket', label: 'Boleto'},
    {value: 'credit_card', label: 'Cartão de crédito'}
  ];

  clientOptions: { id: string; name: string }[] = [];
  productOptions: { id: string; name: string; value: number }[] = [];

  isLoading = false;
  minDate = new Date();

  readonly chargeForm = new FormGroup({
    clientId: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    products: new FormArray([
      new FormGroup({
        _productId: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
        name: new FormControl(''),
        quantity: new FormControl<number>(1, {nonNullable: true, validators: [Validators.required, Validators.min(1)]}),
        value: new FormControl<number>(0, {nonNullable: true, validators: [Validators.required, Validators.min(0.02)]})
      })
    ], {validators: [this.uniqueProductValidator.bind(this)]}),
    dueDate: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    paymentMethod: new FormGroup({
      pix: new FormControl(false, {nonNullable: true}),
      boleto: new FormControl(false, {nonNullable: true}),
      creditCard: new FormControl(false, {nonNullable: true}),
    }, {validators: [this.atLeastOnePaymentMethodValidator]}),
  });

  constructor(
    private readonly http: HttpClient,
    private readonly dialogRef: MatDialogRef<CreateChargeDialogComponent>,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.getClientOptions();
    this.getProductOptions();
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (this.chargeForm.invalid) {
      this.chargeForm.markAllAsTouched();
      return;
    }
    this.createInvoice();
  }

  private createInvoice(): void {
    this.isLoading = true;

    const url = `${environment.apiUrl}/invoice`;
    const rawValue = this.chargeForm.getRawValue();

    let formattedDueDate = '';
    if (rawValue.dueDate) {
      const d = new Date(rawValue.dueDate);
      formattedDueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    const payload = {
      _clientId: rawValue.clientId,
      items: rawValue.products.map((item) => ({
        ...item,
        value: this.toCents(item.value)
      })),
      dueDate: formattedDueDate,
      paymentMethods: {
        pix: {enable: rawValue.paymentMethod.pix},
        boleto: {enable: rawValue.paymentMethod.boleto},
        creditCard: {enable: rawValue.paymentMethod.creditCard},
      },
      referenceId: localStorage.getItem('user_id')
    };

    this.http.post(url, payload).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => this.dialogRef.close(data),
      error: (err) => {
        Swal.fire({
          title: 'Erro',
          text: err?.error?.message ?? 'Erro ao criar cobrança',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  private getClientOptions(): void {
    const url = `${environment.apiUrl}/client/options`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.clientOptions = data ?? [];
      }
    });
  }

  private getProductOptions(): void {
    const url = `${environment.apiUrl}/product/options`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.productOptions = data ?? [];
      }
    });
  }

  private atLeastOnePaymentMethodValidator(control: AbstractControl): ValidationErrors | null {
    const methods = control.value;
    if (!methods) return null;
    return methods.pix || methods.boleto || methods.creditCard ? null : {required: true};
  }

  private uniqueProductValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const products = control.value;
    const ids = products.map((p: any) => p._productId).filter((id: any) => !!id);
    return ids.length === new Set(ids).size ? null : {duplicateProducts: true};
  }

  get products(): FormArray {
    return this.chargeForm.get('products') as FormArray;
  }

  addProduct(): void {
    this.products.push(new FormGroup({
      _productId: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      name: new FormControl(''),
      quantity: new FormControl<number>(1, {nonNullable: true, validators: [Validators.required, Validators.min(1)]}),
      value: new FormControl<number>(0, {nonNullable: true, validators: [Validators.required, Validators.min(0.02)]})
    }));
  }

  removeProduct(index: number): void {
    this.products.removeAt(index);
  }

  onProductChange(index: number, productId: string): void {
    const product = this.productOptions.find(p => p.id === productId);
    if (product) {
      this.products.at(index).patchValue({
        value: this.toReal(product.value),
        name: product.name
      });
    }
  }

  private toReal(valueInCents: number): number {
    return valueInCents / 100;
  }

  private toCents(valueInReais: number): number {
    return Math.round(valueInReais * 100);
  }
}
