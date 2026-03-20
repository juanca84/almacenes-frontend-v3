import type { Persona } from '@/types/auth.types'

export function getNombreCompleto(
  persona: Pick<Persona, 'nombres' | 'primerApellido' | 'segundoApellido'>
): string {
  return [persona.nombres, persona.primerApellido, persona.segundoApellido]
    .filter(Boolean)
    .join(' ')
}

export function formatDocumento(
  persona: Pick<Persona, 'tipoDocumento' | 'nroDocumento'>
): string {
  return `${persona.tipoDocumento}: ${persona.nroDocumento}`
}
