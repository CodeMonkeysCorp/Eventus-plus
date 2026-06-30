import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserCreatePayload, UserResponse, UserRole, UserUpdatePayload } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { CustomSelectComponent, CustomSelectOption } from '../../shared/ui/custom-select.component';
import { formatDateTime } from '../../shared/utils/date.utils';
import { roleLabel } from '../../shared/utils/labels.utils';

type UserField = 'fullName' | 'email' | 'password';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.css'
})
export class AdminUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    password: ['', [Validators.maxLength(72)]],
    role: ['PARTICIPANT' as UserRole, [Validators.required]]
  });

  loading = true;
  submitting = false;
  statusUpdatingUserId: number | null = null;
  editingUserId: number | null = null;
  query = '';
  errorMessage = '';
  successMessage = '';
  submitAttempted = false;
  users: UserResponse[] = [];

  readonly roleOptions: UserRole[] = ['PARTICIPANT', 'OPERATOR', 'ADMIN'];
  readonly roleSelectOptions: CustomSelectOption[] = this.roleOptions.map((role) => ({
    value: role,
    label: roleLabel(role)
  }));

  ngOnInit(): void {
    this.resetForm();
    this.loadUsers();
  }

  get isEditing(): boolean {
    return this.editingUserId !== null;
  }

  get filteredUsers(): UserResponse[] {
    const normalizedQuery = normalizeSearch(this.query);
    if (!normalizedQuery) {
      return this.users;
    }

    return this.users.filter((user) => searchableUserText(user).includes(normalizedQuery));
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => user.active).length;
  }

  get staffUsers(): number {
    return this.users.filter((user) => user.role === 'ADMIN' || user.role === 'OPERATOR').length;
  }

  get passwordLabel(): string {
    return this.isEditing ? 'Nova senha' : 'Senha';
  }

  get passwordHint(): string {
    return this.isEditing ? 'Preencha somente para redefinir.' : 'Use entre 8 e 72 caracteres.';
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.submitAttempted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const normalizedPassword = raw.password.trim();

    this.submitting = true;
    const request$ = this.isEditing && this.editingUserId !== null
      ? this.usersService.update(this.editingUserId, {
          fullName: raw.fullName.trim(),
          email: raw.email.trim().toLowerCase(),
          password: normalizedPassword || null,
          role: raw.role
        } satisfies UserUpdatePayload)
      : this.usersService.create({
          fullName: raw.fullName.trim(),
          email: raw.email.trim().toLowerCase(),
          password: normalizedPassword,
          role: raw.role
        } satisfies UserCreatePayload);

    request$
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditing ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.';
          this.resetForm();
          this.loadUsers();
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível salvar o usuário.');
        }
      });
  }

  edit(user: UserResponse): void {
    if (this.isCurrentUser(user)) {
      return;
    }

    this.editingUserId = user.id;
    this.successMessage = '';
    this.errorMessage = '';
    this.submitAttempted = false;
    this.updatePasswordValidators();
    this.form.reset({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  toggleStatus(user: UserResponse): void {
    if (this.isCurrentUser(user)) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.statusUpdatingUserId = user.id;

    this.usersService.updateStatus(user.id, { active: !user.active })
      .subscribe({
        next: (updatedUser) => {
          this.users = this.users.map((currentUser) => currentUser.id === updatedUser.id ? updatedUser : currentUser);
          this.successMessage = updatedUser.active ? 'Usuário reativado com sucesso.' : 'Usuário desativado com sucesso.';
          this.statusUpdatingUserId = null;
        },
        error: (error: unknown) => {
          this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível atualizar o status do usuário.');
          this.statusUpdatingUserId = null;
        }
      });
  }

  isCurrentUser(user: UserResponse): boolean {
    return this.authService.user?.id === user.id;
  }

  roleLabel(role: UserRole): string {
    return roleLabel(role);
  }

  roleClass(role: UserRole): string {
    return `is-${role.toLowerCase()}`;
  }

  activeLabel(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  activeClass(active: boolean): string {
    return active ? 'is-published' : 'is-neutral';
  }

  formatDateTime(value: string): string {
    return formatDateTime(value);
  }

  fieldInvalid(field: UserField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitAttempted);
  }

  fieldError(field: UserField): string {
    const control = this.form.controls[field];
    if (!this.fieldInvalid(field)) {
      return '';
    }

    if (field === 'fullName') {
      if (control.hasError('required')) {
        return 'Informe o nome.';
      }

      if (control.hasError('maxlength')) {
        return 'Use no máximo 120 caracteres.';
      }
    }

    if (field === 'email') {
      if (control.hasError('required')) {
        return 'Informe o email.';
      }

      if (control.hasError('email')) {
        return 'Digite um email válido.';
      }

      if (control.hasError('maxlength')) {
        return 'Use no máximo 160 caracteres.';
      }
    }

    if (field === 'password') {
      if (control.hasError('required')) {
        return 'Informe uma senha.';
      }

      if (control.hasError('minlength')) {
        return 'Use no mínimo 8 caracteres.';
      }

      if (control.hasError('maxlength')) {
        return 'Use no máximo 72 caracteres.';
      }
    }

    return 'Revise este campo.';
  }

  trackByUserId(_index: number, user: UserResponse): number {
    return user.id;
  }

  private loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.usersService.list().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar os usuários.');
        this.loading = false;
      }
    });
  }

  private resetForm(): void {
    this.editingUserId = null;
    this.submitAttempted = false;
    this.form.reset({
      fullName: '',
      email: '',
      password: '',
      role: 'PARTICIPANT'
    });
    this.updatePasswordValidators();
  }

  private updatePasswordValidators(): void {
    if (this.isEditing) {
      this.form.controls.password.setValidators([Validators.minLength(8), Validators.maxLength(72)]);
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(72)]);
    }

    this.form.controls.password.updateValueAndValidity({ emitEvent: false });
  }
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

function searchableUserText(user: UserResponse): string {
  return normalizeSearch([
    user.fullName,
    user.email,
    roleLabel(user.role),
    user.active ? 'ativo' : 'inativo',
    formatDateTime(user.createdAt)
  ].join(' '));
}
