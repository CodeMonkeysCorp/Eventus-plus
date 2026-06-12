import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { CertificateResponse } from '../../core/models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { CertificatesService } from '../../core/services/certificates.service';
import { formatDateTime } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css'
})
export class CertificatesComponent implements OnInit {
  private readonly certificatesService = inject(CertificatesService);
  private readonly apiErrorService = inject(ApiErrorService);

  loading = true;
  errorMessage = '';
  certificates: CertificateResponse[] = [];

  ngOnInit(): void {
    this.loadCertificates();
  }

  formatDateTime(value: string | null): string {
    return formatDateTime(value);
  }

  trackByCertificateId(_index: number, certificate: CertificateResponse): number {
    return certificate.registrationId;
  }

  private loadCertificates(): void {
    this.loading = true;
    this.errorMessage = '';

    this.certificatesService.listMine().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.apiErrorService.toMessage(error, 'Não foi possível carregar seus certificados.');
        this.loading = false;
      }
    });
  }
}
