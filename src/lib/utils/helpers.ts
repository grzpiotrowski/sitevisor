export function getRandomHexColor(): number {
  return Math.floor(Math.random() * 16777215);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
  };

  return date.toLocaleTimeString('en-IE', options);
}