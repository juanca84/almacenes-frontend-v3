import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMensaje(error: unknown): string | undefined {
  return (error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje
}

export function getErrorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status
}

export function getErrorCodigo(error: unknown): number | undefined {
  return (error as { response?: { data?: { codigo?: number } } })?.response?.data?.codigo
}

/**
 * Wrapper estándar para llamadas a la API con feedback de toast.
 *
 * Maneja el contrato `{ finalizado, mensaje, datos }` y centraliza
 * el try/catch + toast repetido en todos los módulos.
 *
 * @returns `true` si la operación fue exitosa, `false` en cualquier error.
 *
 * @example
 * const ok = await withToast(
 *   () => usuariosService.inactivar(id),
 *   { successMsg: 'Usuario inactivado', errorMsg: 'Error al cambiar estado', onSuccess: recargar }
 * )
 */
export async function withToast<T>(
  fn: () => Promise<{ data: { finalizado: boolean; mensaje: string; datos: T } }>,
  options: {
    successMsg?: string
    errorMsg: string
    onSuccess?: (datos: T) => void
    /** Retorna `true` si el error fue manejado y no se debe mostrar el toast por defecto. */
    onError?: (error: unknown) => boolean
  }
): Promise<boolean> {
  try {
    const { data } = await fn()
    if (data.finalizado) {
      if (options.successMsg) toast.success(options.successMsg)
      options.onSuccess?.(data.datos)
      return true
    }
    toast.error(data.mensaje)
    return false
  } catch (error) {
    if (options.onError?.(error)) return false
    toast.error(getErrorMensaje(error) ?? options.errorMsg)
    return false
  }
}
