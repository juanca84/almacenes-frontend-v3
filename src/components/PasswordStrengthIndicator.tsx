import { FORTALEZA_CONTRASENA } from '@/constants/contrasena'
import type { ValidarContrasenaResult } from '@/types/usuario.types'

interface PasswordStrengthIndicatorProps {
  visible: boolean
  validacion: ValidarContrasenaResult | null
  validando: boolean
  errorValidacion: boolean
}

export function PasswordStrengthIndicator({
  visible,
  validacion,
  validando,
  errorValidacion,
}: PasswordStrengthIndicatorProps) {
  if (!visible) return null

  const fortaleza = validacion != null ? FORTALEZA_CONTRASENA[validacion.score] : null

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {FORTALEZA_CONTRASENA.map((f, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              !validando && validacion != null && i <= validacion.score
                ? ''
                : validando ? 'bg-muted animate-pulse' : 'bg-muted'
            }`}
            style={
              !validando && validacion != null && i <= validacion.score
                ? { backgroundColor: f.hex }
                : undefined
            }
          />
        ))}
      </div>
      {validando ? (
        <p className="text-xs text-muted-foreground">Validando...</p>
      ) : errorValidacion ? (
        <p className="text-xs text-destructive">No se pudo validar la contraseña</p>
      ) : fortaleza && validacion ? (
        <p className="text-xs font-medium" style={{ color: fortaleza.hex }}>
          {validacion.nivel}
        </p>
      ) : null}
    </div>
  )
}
