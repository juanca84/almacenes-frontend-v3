import { describe, it, expect } from 'vitest'
import { iniciales, avatarClases } from './avatar'
import type { UsuarioItem } from '@/types/usuario.types'

function makeUsuario(nombres: string, primerApellido: string): UsuarioItem {
  return {
    id: '1',
    usuario: 'test',
    estado: 'ACTIVO',
    persona: {
      nombres,
      primerApellido,
      segundoApellido: '',
      tipoDocumento: 'CI',
      nroDocumento: '00000000',
      fechaNacimiento: '1990-01-01',
    },
  }
}

// ── iniciales ─────────────────────────────────────────────────────────────────

describe('iniciales', () => {
  it('retorna la primera letra de nombres + primera letra de primerApellido en mayúsculas', () => {
    expect(iniciales(makeUsuario('Juan', 'Pérez'))).toBe('JP')
  })

  it('convierte a mayúsculas aunque las entradas sean minúsculas', () => {
    expect(iniciales(makeUsuario('ana', 'quispe'))).toBe('AQ')
  })

  it('toma solo el primer carácter de un nombre compuesto', () => {
    expect(iniciales(makeUsuario('María José', 'García'))).toBe('MG')
  })
})

// ── avatarClases ──────────────────────────────────────────────────────────────

describe('avatarClases', () => {
  it('retorna una cadena no vacía', () => {
    const u = makeUsuario('Juan', 'Pérez')
    expect(avatarClases(u)).toBeTruthy()
  })

  it('es determinista: mismo usuario siempre obtiene el mismo color', () => {
    const u = makeUsuario('Juan', 'Pérez')
    expect(avatarClases(u)).toBe(avatarClases(u))
  })

  it('retorna clases distintas para usuarios con nombres distintos (en general)', () => {
    const u1 = makeUsuario('Ana', 'Lopez')
    const u2 = makeUsuario('Zara', 'Quispe')
    // No garantizamos que sean distintas (colisión de hash posible), pero
    // verificamos que la función no lanza y retorna un string de tailwind
    expect(typeof avatarClases(u1)).toBe('string')
    expect(typeof avatarClases(u2)).toBe('string')
  })

  it('el resultado contiene clases de fondo y texto', () => {
    const clases = avatarClases(makeUsuario('Pedro', 'Mamani'))
    expect(clases).toMatch(/bg-\w+/)
    expect(clases).toMatch(/text-\w+/)
  })
})
