import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { usuariosService } from '@/services/usuarios.service'
import type { UsuarioItem, RolDisponible } from '@/types/usuario.types'
import { getCatalogoGrupo } from '@/lib/catalogo'
import { CATALOGO_GRUPOS } from '@/constants/catalogo'
import { getNombreCompleto } from '@/lib/usuario'

// ── Schemas ───────────────────────────────────────────────────────────────────

export const crearSchema = z.object({
  correoElectronico: z.email('Email inválido'),
  roles: z.array(z.string()).min(1, 'Seleccione al menos un rol'),
  persona: z.object({
    tipoDocumento: z.string().min(1, 'Requerido'),
    nroDocumento: z.string().min(5, 'Mínimo 5 caracteres'),
    genero: z.string().optional(),
    telefono: z.string().optional(),
    nombres: z.string().min(2, 'Requerido'),
    primerApellido: z.string().min(2, 'Requerido'),
    segundoApellido: z.string().optional(),
    fechaNacimiento: z.string().min(1, 'Requerido'),
  }),
})

// estado se cambia desde la tabla con endpoints dedicados (/activacion | /inactivacion)
export const editarSchema = z.object({
  correoElectronico: z.email('Email inválido').optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, 'Seleccione al menos un rol'),
  genero: z.string().optional(),
  telefono: z.string().optional(),
  nombres: z.string().min(2, 'Requerido'),
  primerApellido: z.string().min(2, 'Requerido'),
  segundoApellido: z.string().optional(),
  fechaNacimiento: z.string().min(1, 'Requerido'),
})

export type CrearValues = z.infer<typeof crearSchema>
export type EditarValues = z.infer<typeof editarSchema>

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseUsuarioFormProps {
  open: boolean
  usuario?: UsuarioItem | null
  onClose: () => void
  onSuccess: () => void
}

export function useUsuarioForm({ open, usuario, onClose, onSuccess }: UseUsuarioFormProps) {
  const esEdicion = !!usuario
  const [roles, setRoles] = useState<RolDisponible[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  const catalogoGenero  = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.GENERO), [])
  const catalogoTipoDoc = useMemo(() => getCatalogoGrupo(CATALOGO_GRUPOS.TIPO_DOCUMENTO), [])

  const crearForm = useForm<CrearValues>({
    resolver: zodResolver(crearSchema),
    defaultValues: {
      correoElectronico: '',
      roles: [],
      persona: {
        tipoDocumento: 'CI',
        nroDocumento: '',
        genero: '',
        telefono: '',
        nombres: '',
        primerApellido: '',
        segundoApellido: '',
        fechaNacimiento: '',
      },
    },
  })

  const editarForm = useForm<EditarValues>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      correoElectronico: '',
      roles: [],
      genero: '',
      telefono: '',
      nombres: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
    },
  })

  const { reset: resetCrear } = crearForm
  const { reset: resetEditar } = editarForm

  useEffect(() => {
    if (!open) return

    if (usuario) {
      resetEditar({
        correoElectronico: usuario.correoElectronico ?? '',
        roles: (usuario.usuarioRol ?? []).map((r) => r.rol.id),
        genero: usuario.persona.genero ?? '',
        telefono: usuario.persona.telefono ?? '',
        nombres: usuario.persona.nombres,
        primerApellido: usuario.persona.primerApellido,
        segundoApellido: usuario.persona.segundoApellido ?? '',
        fechaNacimiento: usuario.persona.fechaNacimiento ?? '',
      })
    }

    setLoadingRoles(true)
    usuariosService.listarRoles()
      .then(({ data }) => { if (data.finalizado) setRoles(data.datos) })
      .catch(() => toast.error('Error al cargar los roles'))
      .finally(() => setLoadingRoles(false))

    if (!usuario) resetCrear()
  }, [usuario, open, resetCrear, resetEditar])

  const onSubmitCrear = async (values: CrearValues) => {
    try {
      const { data } = await usuariosService.crear(values)
      if (data.finalizado) {
        toast.success('Usuario creado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al crear el usuario')
    }
  }

  const onSubmitEditar = async (values: EditarValues) => {
    try {
      const payload = {
        correoElectronico: values.correoElectronico || undefined,
        roles: values.roles,
        persona: {
          genero: values.genero || undefined,
          telefono: values.telefono || undefined,
          nombres: values.nombres,
          primerApellido: values.primerApellido,
          segundoApellido: values.segundoApellido || undefined,
          fechaNacimiento: values.fechaNacimiento,
        },
      }
      const { data } = await usuariosService.actualizar(usuario!.id, payload)
      if (data.finalizado) {
        toast.success('Usuario actualizado correctamente')
        onSuccess()
      } else {
        toast.error(data.mensaje)
      }
    } catch {
      toast.error('Error al actualizar el usuario')
    }
  }

  const nombreCompleto = usuario ? getNombreCompleto(usuario.persona) : ''

  return {
    esEdicion,
    roles,
    loadingRoles,
    crearForm,
    editarForm,
    catalogoGenero,
    catalogoTipoDoc,
    nombreCompleto,
    onSubmitCrear,
    onSubmitEditar,
    onClose,
  }
}
