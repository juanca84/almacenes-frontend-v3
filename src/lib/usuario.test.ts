import { describe, it, expect } from 'vitest'
import { getNombreCompleto, formatDocumento } from './usuario'

// ── getNombreCompleto ─────────────────────────────────────────────────────────

describe('getNombreCompleto', () => {
  it('combina nombres y ambos apellidos', () => {
    expect(
      getNombreCompleto({
        nombres: 'Juan Carlos',
        primerApellido: 'Pérez',
        segundoApellido: 'López',
      })
    ).toBe('Juan Carlos Pérez López')
  })

  it('omite el segundo apellido si está vacío', () => {
    expect(
      getNombreCompleto({
        nombres: 'María',
        primerApellido: 'García',
        segundoApellido: '',
      })
    ).toBe('María García')
  })

  it('funciona con solo nombres y primer apellido', () => {
    expect(
      getNombreCompleto({
        nombres: 'Pedro',
        primerApellido: 'Quispe',
        segundoApellido: '',
      })
    ).toBe('Pedro Quispe')
  })
})

// ── formatDocumento ───────────────────────────────────────────────────────────

describe('formatDocumento', () => {
  it('formatea CI correctamente', () => {
    expect(formatDocumento({ tipoDocumento: 'CI', nroDocumento: '12345678' })).toBe('CI: 12345678')
  })

  it('formatea PASAPORTE correctamente', () => {
    expect(formatDocumento({ tipoDocumento: 'PASAPORTE', nroDocumento: 'AB123456' })).toBe(
      'PASAPORTE: AB123456'
    )
  })
})
