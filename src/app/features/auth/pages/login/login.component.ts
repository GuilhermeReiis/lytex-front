import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ChangeDetectorRef
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {finalize} from 'rxjs';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import Swal from 'sweetalert2';

import {AuthCardComponent} from '../../components/auth-card/auth-card.component';
import {TokenService} from '../../../../core/services/token.service';
import {environment} from '../../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly hide = signal(true);

  isLoading = false;

  readonly loginForm = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  togglePasswordVisibility(event: MouseEvent): void {
    event.stopPropagation();
    this.hide.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const {email, password} = this.loginForm.getRawValue();

    this.http.post<{ access_token: string; user_id: string }>(
      `${environment.apiUrl}/auth/login`,
      {email, password}
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (res) => {
        this.tokenService.set(res.access_token);
        this.tokenService.set(res.user_id, 'user_id');
        
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        Swal.fire({
          title: 'Erro',
          text: err?.error?.message ?? 'Erro ao realizar login',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
