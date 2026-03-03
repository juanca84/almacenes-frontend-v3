const fechaLarga = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/**
 * Formatea una fecha ISO ("yyyy-MM-dd" o "yyyy-MM-ddT…") como "15 de mayo de 1990".
 * Parsea los componentes en hora local para evitar desfases de zona horaria.
 */
export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('T')[0].split('-').map(Number)
  return fechaLarga.format(new Date(y, m - 1, d))
}
