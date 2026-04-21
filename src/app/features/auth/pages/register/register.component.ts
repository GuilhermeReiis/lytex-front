import {Component, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatCheckbox} from '@angular/material/checkbox';
import {AuthCardComponent} from '../../components/auth-card/auth-card.component';
import {MatCardActions} from '@angular/material/card';
import {Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import Swal from 'sweetalert2';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : {passwordMismatch: true};
};

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    MatCheckbox,
    AuthCardComponent,
    MatButton,
    MatCardActions,
    RouterLink
  ]
})
export class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirm_password: new FormControl('', [Validators.required]),
  }, {validators: passwordMatchValidator});

  constructor(private readonly http: HttpClient, private readonly router: Router) {
  }

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const {name, email, password} = this.registerForm.getRawValue();

    this.http.post('http://localhost:3000/auth/register', {
      name,
      email,
      password
    }).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Usuário criado com sucesso',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Erro',
          text: err.error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
