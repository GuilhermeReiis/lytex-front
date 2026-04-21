import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
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
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {environment} from '../../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
    MatButton,
    MatIconButton,
    MatIcon,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule
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

  clientOptions: {
    id: string;
    name: string;
  }[] = []

  productOptions: {
    id: string;
    name: string;
    value: number;
  }[] = []

  chargeForm = new FormGroup({
    clientId: new FormControl('', [Validators.required]),
    products: new FormArray([
      new FormGroup({
        _productId: new FormControl('', [Validators.required]),
        name: new FormControl(''),
        quantity: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
        value: new FormControl<number>(0, [Validators.required, Validators.min(2)])
      })
    ], [this.uniqueProductValidator.bind(this)]),
    dueDate: new FormControl('', [Validators.required]),
    paymentMethod: new FormGroup({
      pix: new FormControl(false),
      boleto: new FormControl(false),
      creditCard: new FormControl(false),
    }, [this.atLeastOnePaymentMethodValidator]),
  });

  atLeastOnePaymentMethodValidator(control: AbstractControl): ValidationErrors | null {
    const methods = control.value;
    if (!methods) return null;
    const hasAtLeastOne = methods.pix || methods.boleto || methods.creditCard;
    return hasAtLeastOne ? null : {required: true};
  }

  constructor(private readonly http: HttpClient, private readonly dialogRef: MatDialogRef<CreateChargeDialogComponent>) {
  }

  ngOnInit() {
    this.getClientOptions();
    this.getProductOptions()
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    if (this.chargeForm.invalid) {
      this.chargeForm.markAllAsTouched();
      return;
    }

    this.createInvoice();
  }

  createInvoice() {
    const url = `${environment.apiUrl}/invoice`;
    const rawValue = this.chargeForm.getRawValue();

    let formattedDueDate = '';
    if (rawValue.dueDate) {
      const d = new Date(rawValue.dueDate);
      formattedDueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    const payload = {
      _clientId: rawValue.clientId,
      items: rawValue.products,
      dueDate: formattedDueDate,
      paymentMethods: {
        pix: {
          enable: rawValue.paymentMethod.pix
        },
        boleto: {
          enable: rawValue.paymentMethod.boleto
        },
        creditCard: {
          enable: rawValue.paymentMethod.creditCard
        },
      },
      referenceId: localStorage.getItem('user_id')
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

  getClientOptions() {
    const url = `${environment.apiUrl}/client/options`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        const results = data ?? [];
        setTimeout(() => {
          this.clientOptions = results;
        });
      },
    });
  }

  getProductOptions() {
    const url = `${environment.apiUrl}/product/options`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        const results = data ?? [];
        setTimeout(() => {
          this.productOptions = results;
        });
      },
    });
  }

  uniqueProductValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const products = control.value;
    const productIds = products.map((p: any) => p.productId).filter((id: any) => !!id);
    const hasDuplicates = productIds.length !== new Set(productIds).size;
    return hasDuplicates ? {duplicateProducts: true} : null;
  }

  get products() {
    return this.chargeForm.get('products') as FormArray;
  }

  addProduct() {
    this.products.push(new FormGroup({
      productId: new FormControl('', [Validators.required]),
      name: new FormControl(''),
      quantity: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
      value: new FormControl<number>(0, [Validators.required, Validators.min(2)])
    }));
  }

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  onProductChange(index: number, productId: string) {
    const product = this.productOptions.find(p => p.id === productId);
    if (product) {
      this.products.at(index).patchValue({
        value: product.value,
        name: product.name
      });
    }
  }

}
