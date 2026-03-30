import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cn, getErrorMensaje, getErrorStatus, getErrorCodigo, withToast } from './utils'

// ── cn ────────────────────────────────────────────────────────────────────────

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('omite valores falsy', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('resuelve conflictos de tailwind (última clase gana)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('aplica clases condicionales con objetos', () => {
    expect(cn({ 'font-bold': true, italic: false })).toBe('font-bold')
  })
})

// ── getErrorMensaje ───────────────────────────────────────────────────────────

describe('getErrorMensaje', () => {
  it('extrae mensaje de un error de axios', () => {
    const error = { response: { data: { mensaje: 'No autorizado' } } }
    expect(getErrorMensaje(error)).toBe('No autorizado')
  })

  it('retorna undefined si no hay response', () => {
    expect(getErrorMensaje(new Error('Network error'))).toBeUndefined()
  })

  it('retorna undefined para null', () => {
    expect(getErrorMensaje(null)).toBeUndefined()
  })

  it('retorna undefined si el mensaje no existe en data', () => {
    const error = { response: { data: {} } }
    expect(getErrorMensaje(error)).toBeUndefined()
  })
})

// ── getErrorStatus ────────────────────────────────────────────────────────────

describe('getErrorStatus', () => {
  it('extrae el status HTTP de un error de axios', () => {
    const error = { response: { status: 403 } }
    expect(getErrorStatus(error)).toBe(403)
  })

  it('retorna undefined si no hay response', () => {
    expect(getErrorStatus(new Error('Network error'))).toBeUndefined()
  })

  it('retorna undefined para null', () => {
    expect(getErrorStatus(null)).toBeUndefined()
  })
})

// ── getErrorCodigo ────────────────────────────────────────────────────────────

describe('getErrorCodigo', () => {
  it('extrae el codigo de negocio del error', () => {
    const error = { response: { data: { codigo: 1042 } } }
    expect(getErrorCodigo(error)).toBe(1042)
  })

  it('retorna undefined si no hay codigo', () => {
    const error = { response: { data: {} } }
    expect(getErrorCodigo(error)).toBeUndefined()
  })
})

// ── withToast ─────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
  },
}))

import { toast } from 'sonner'

describe('withToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna true y muestra toast de éxito cuando finalizado es true', async () => {
    const fn = vi.fn().mockResolvedValue({
      data: { finalizado: true, mensaje: 'OK', datos: { id: '1' } },
    })
    const result = await withToast(fn, { successMsg: 'Creado', errorMsg: 'Error' })

    expect(result).toBe(true)
    expect(toast.success).toHaveBeenCalledWith('Creado')
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('retorna true sin toast si no se pasa successMsg', async () => {
    const fn = vi.fn().mockResolvedValue({
      data: { finalizado: true, mensaje: 'OK', datos: null },
    })
    const result = await withToast(fn, { errorMsg: 'Error' })

    expect(result).toBe(true)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('llama onSuccess con los datos cuando finalizado es true', async () => {
    const datos = { id: '42' }
    const fn = vi.fn().mockResolvedValue({
      data: { finalizado: true, mensaje: 'OK', datos },
    })
    const onSuccess = vi.fn()
    await withToast(fn, { errorMsg: 'Error', onSuccess })

    expect(onSuccess).toHaveBeenCalledWith(datos)
  })

  it('retorna false y muestra el mensaje de la API cuando finalizado es false', async () => {
    const fn = vi.fn().mockResolvedValue({
      data: { finalizado: false, mensaje: 'Registro duplicado', datos: null },
    })
    const result = await withToast(fn, { errorMsg: 'Error genérico' })

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Registro duplicado')
  })

  it('muestra el mensaje de axios cuando la petición lanza', async () => {
    const fn = vi.fn().mockRejectedValue({
      response: { data: { mensaje: 'Token expirado' } },
    })
    const result = await withToast(fn, { errorMsg: 'Error genérico' })

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Token expirado')
  })

  it('usa el errorMsg como fallback si el error no tiene mensaje de axios', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Network Error'))
    const result = await withToast(fn, { errorMsg: 'Error de red' })

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Error de red')
  })

  it('no muestra toast por defecto si onError retorna true (error manejado)', async () => {
    const error = { response: { status: 403 } }
    const fn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn().mockReturnValue(true)

    const result = await withToast(fn, { errorMsg: 'Error', onError })

    expect(result).toBe(false)
    expect(onError).toHaveBeenCalledWith(error)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('muestra toast por defecto si onError retorna false (error no manejado)', async () => {
    const error = { response: { data: { mensaje: 'Error del servidor' } } }
    const fn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn().mockReturnValue(false)

    await withToast(fn, { errorMsg: 'Fallback', onError })

    expect(toast.error).toHaveBeenCalledWith('Error del servidor')
  })
})
