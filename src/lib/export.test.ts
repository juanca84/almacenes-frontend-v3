import { describe, it, expect, vi, afterEach } from 'vitest'
import { escapeCsvCell, toCSV, csvFilename } from './export'

describe('escapeCsvCell', () => {
  it('devuelve el valor sin cambios si no hay caracteres especiales', () => {
    expect(escapeCsvCell('hola')).toBe('hola')
  })

  it('envuelve en comillas si contiene coma', () => {
    expect(escapeCsvCell('uno,dos')).toBe('"uno,dos"')
  })

  it('envuelve en comillas si contiene comilla doble y la escapa', () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('envuelve en comillas si contiene salto de línea', () => {
    expect(escapeCsvCell('linea1\nlinea2')).toBe('"linea1\nlinea2"')
  })

  it('maneja cadena vacía', () => {
    expect(escapeCsvCell('')).toBe('')
  })
})

describe('toCSV', () => {
  it('genera cabecera + filas separadas por CRLF', () => {
    const result = toCSV(
      ['Nombre', 'Estado'],
      [
        ['Alice', 'ACTIVO'],
        ['Bob', 'INACTIVO'],
      ]
    )
    expect(result).toBe('Nombre,Estado\r\nAlice,ACTIVO\r\nBob,INACTIVO')
  })

  it('escapa celdas con comas en las filas', () => {
    const result = toCSV(['Descripción'], [['uno, dos, tres']])
    expect(result).toBe('Descripción\r\n"uno, dos, tres"')
  })

  it('genera solo la cabecera cuando no hay filas', () => {
    const result = toCSV(['A', 'B'], [])
    expect(result).toBe('A,B')
  })
})

describe('csvFilename', () => {
  afterEach(() => vi.useRealTimers())

  it('genera nombre con prefijo y fecha YYYY-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'))
    expect(csvFilename('usuarios')).toBe('usuarios_2026-03-29.csv')
  })

  it('usa el prefijo proporcionado', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-29T12:00:00Z'))
    expect(csvFilename('roles')).toBe('roles_2026-03-29.csv')
  })
})
