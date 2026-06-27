import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditLogResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuditService } from '../../core/services/audit.service';
import { CustomSelectComponent, CustomSelectOption } from '../../shared/ui/custom-select.component';
import { formatDateTime } from '../../shared/utils/date.utils';
import { auditActionLabel } from '../../shared/utils/labels.utils';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css'
})
export class AuditComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  errorMessage = '';
  limit = 50;
  logs: AuditLogResponse[] = [];

  readonly limits = [20, 50, 100];
  readonly limitOptions: CustomSelectOption[] = this.limits.map((limit) => ({
    value: limit,
    label: `${limit} registros`
  }));

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.auditService.listRecent(this.limit).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar os logs.');
        this.loading = false;
      }
    });
  }

  formatDateTime(value: string): string {
    return formatDateTime(value);
  }

  auditActionLabel(action: string): string {
    return auditActionLabel(action);
  }

  trackByLogId(_index: number, log: AuditLogResponse): number {
    return log.id;
  }
}
