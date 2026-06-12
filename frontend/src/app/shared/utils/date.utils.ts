const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium'
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  return DATE_FORMATTER.format(new Date(value));
}

export function toDateTimeLocalValue(value: string | null | undefined): string {
  return value ? value.slice(0, 16) : '';
}

export function toApiDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}
