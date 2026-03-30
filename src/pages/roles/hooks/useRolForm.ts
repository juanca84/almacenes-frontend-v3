import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { rolesService } from '@/services/roles.service'
import { useRolModulos } from '@/hooks/useRolModulos'
import { getErrorMensaje, getErrorStatus, getErrorCodigo } from '@/lib/utils'
import { ACCIONES_MODULO } from '@/constants/roles'
import type { RolItem } from '@/types/roles.types'

// ── Schemas ───────────────────────────────────────────────────────────────────

const moduloPermisoSchema = z.object({
  id: z.string(),
  acciones: z.array(z.enum(ACCIONES_MODULO)),
})

const baseRolSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  modulos: z.array(moduloPermisoSchema),
})

export const crearRolSchema = baseRolSchema.extend({
  rol: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
})

export const editarRolSchema = baseRolSchema

export type CrearRolValues = z.infer<typeof crearRolSchema>
export type EditarRolValues = z.infer<typeof editarRolSchema>

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseRolFormProps {
  open: boolean
  rol?: RolItem | null
  onClose: () => void
  onSuccess: () => void
}

export function useRolForm({ open, rol, onClose, onSuccess }: UseRolFormProps) {
  const esEdicion = !!rol

  // Precarga los módulos actuales del rol solo en modo edición
  const { modulosRol, loading: loadingModulosRol } = useRolModulos(
    esEdicion && open ? (rol?.id ?? null) : null
  )

  const crearForm = useForm<CrearRolValues>({
    resolver: zodResolver(crearRolSchema),
    defaultValues: { rol: '', nombre: '', modulos: [] },
  })

  const editarForm = useForm<EditarRolValues>({
    resolver: zodResolver(editarRolSchema),
    defaultValues: { nombre: '', modulos: [] },
  })

  const { reset: resetCrear } = crearForm
  const { reset: resetEditar } = editarForm

  // Inicializa el formulario cada vez que se abre el diálogo
  useEffect(() => {
    if (!open) return
    if (!esEdicion) {
      resetCrear({ rol: '', nombre: '', modulos: [] })
    }
  }, [open, esEdicion, resetCrear])

  // Precarga valores de edición cuando llegan los módulos del rol
  useEffect(() => {
    if (!open || !esEdicion || loadingModulosRol) return
    resetEditar({
      nombre: rol!.nombre,
      modulos: modulosRol,
    })
  }, [open, esEdicion, loadingModulosRol, modulosRol, rol, resetEditar])

  const onSubmitCrear = async (values: CrearRolValues) => {
    try {
      const { data } = await rolesService.crear(values)
      if (data.finalizado) {
        toast.success('Rol creado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      if (getErrorCodigo(error) === 412) {
        toast.error('El identificador ya está en uso')
      } else if (getErrorStatus(error) === 403) {
        toast.error('No se puede modificar un rol del sistema')
      } else {
        toast.error(getErrorMensaje(error) ?? 'Error al crear el rol')
      }
    }
  }

  const onSubmitEditar = async (values: EditarRolValues) => {
    try {
      const { data } = await rolesService.actualizar(rol!.id, values)
      if (data.finalizado) {
        toast.success('Rol actualizado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      toast.error(getErrorMensaje(error) ?? 'Error al actualizar el rol')
    }
  }

  return {
    esEdicion,
    crearForm,
    editarForm,
    loadingModulosRol,
    onSubmitCrear,
    onSubmitEditar,
    onClose,
  }
}
