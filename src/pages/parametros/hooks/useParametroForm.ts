import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { parametrosService } from '@/services/parametros.service'
import { getErrorMensaje } from '@/lib/utils'
import type { ParametroItem } from '@/types/parametro.types'

// ── Schemas ───────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  nombre:      z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
  grupo:       z.string().min(1, 'Requerido').max(15, 'Máximo 15 caracteres'),
  descripcion: z.string().min(1, 'Requerido').max(255, 'Máximo 255 caracteres'),
})

// codigo es inmutable: no se incluye en la edición
export const editarSchema = baseSchema

export const crearSchema = baseSchema.extend({
  codigo: z.string().min(1, 'Requerido').max(15, 'Máximo 15 caracteres'),
})

export type CrearValues = z.infer<typeof crearSchema>
export type EditarValues = z.infer<typeof editarSchema>

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseParametroFormProps {
  open: boolean
  parametro?: ParametroItem | null
  onClose: () => void
  onSuccess: () => void
}

export function useParametroForm({ open, parametro, onClose, onSuccess }: UseParametroFormProps) {
  const esEdicion = !!parametro

  const crearForm = useForm<CrearValues>({
    resolver: zodResolver(crearSchema),
    defaultValues: { codigo: '', nombre: '', grupo: '', descripcion: '' },
  })

  const editarForm = useForm<EditarValues>({
    resolver: zodResolver(editarSchema),
    defaultValues: { nombre: '', grupo: '', descripcion: '' },
  })

  const { reset: resetCrear } = crearForm
  const { reset: resetEditar } = editarForm

  useEffect(() => {
    if (!open) return

    if (parametro) {
      resetEditar({
        nombre:      parametro.nombre,
        grupo:       parametro.grupo,
        descripcion: parametro.descripcion,
      })
    } else {
      resetCrear()
    }
  }, [parametro, open, resetCrear, resetEditar])

  const onSubmitCrear = async (values: CrearValues) => {
    try {
      const { data } = await parametrosService.crear(values)
      if (data.finalizado) {
        toast.success('Parámetro creado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      toast.error(getErrorMensaje(error) ?? 'Error al crear el parámetro')
    }
  }

  const onSubmitEditar = async (values: EditarValues) => {
    try {
      const { data } = await parametrosService.actualizar(parametro!.id, values)
      if (data.finalizado) {
        toast.success('Parámetro actualizado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch (error: unknown) {
      toast.error(getErrorMensaje(error) ?? 'Error al actualizar el parámetro')
    }
  }

  return {
    esEdicion,
    crearForm,
    editarForm,
    onSubmitCrear,
    onSubmitEditar,
    onClose,
  }
}
