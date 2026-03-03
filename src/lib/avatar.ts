import type { UsuarioItem } from '@/types/usuario.types'

const PALETA = [
  'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
  'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300',
  'bg-cyan-100   text-cyan-700   dark:bg-cyan-900/40   dark:text-cyan-300',
]

export function avatarClases(u: UsuarioItem): string {
  const hash = (u.persona.nombres + u.persona.primerApellido)
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETA[hash % PALETA.length]
}

export function iniciales(u: UsuarioItem): string {
  return (u.persona.nombres.charAt(0) + u.persona.primerApellido.charAt(0)).toUpperCase()
}
