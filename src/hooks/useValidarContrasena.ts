import { useEffect, useRef, useState } from 'react'

import { usuariosService } from '@/services/usuarios.service'
import type { ValidarContrasenaResult } from '@/types/usuario.types'

interface UseValidarContrasenaReturn {
  validacion: ValidarContrasenaResult | null
  validando: boolean
  errorValidacion: boolean
}

/**
 * Valida la fortaleza de una contraseña con debounce 500ms.
 * Llama a POST /usuarios/cuenta/validar-contrasena en texto plano.
 */
export function useValidarContrasena(contrasena: string): UseValidarContrasenaReturn {
  const [validacion, setValidacion]         = useState<ValidarContrasenaResult | null>(null)
  const [validando, setValidando]           = useState(false)
  const [errorValidacion, setErrorValidacion] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!contrasena) {
      setValidacion(null)
      setValidando(false)
      setErrorValidacion(false)
      return
    }

    setValidando(true)
    setErrorValidacion(false)

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await usuariosService.validarContrasena(contrasena)
        if (data.finalizado) {
          setValidacion(data.datos)
        } else {
          setErrorValidacion(true)
        }
      } catch {
        setErrorValidacion(true)
      } finally {
        setValidando(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [contrasena])

  return { validacion, validando, errorValidacion }
}
