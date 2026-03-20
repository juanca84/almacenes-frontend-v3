import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
