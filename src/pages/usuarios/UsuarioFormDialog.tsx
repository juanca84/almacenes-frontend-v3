import { Calendar, CreditCard, Mail, Phone, ShieldCheck, UserPen, UserPlus } from 'lucide-react'

import type { UsuarioItem } from '@/types/usuario.types'
import { avatarClases, iniciales } from '@/lib/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsuarioForm } from './hooks/useUsuarioForm'
import type { RolDisponible } from '@/types/usuario.types'

// ── Subcomponentes ────────────────────────────────────────────────────────────

interface RolesCheckboxListProps {
  roles: RolDisponible[]
  loading: boolean
  value: string[]
  onChange: (ids: string[]) => void
}

function RolesCheckboxList({ roles, loading, value, onChange }: RolesCheckboxListProps) {
  if (loading) return <p className="text-sm text-muted-foreground">Cargando roles...</p>
  if (roles.length === 0) return <p className="text-sm text-muted-foreground">No hay roles disponibles</p>

  return (
    <>
      {roles.map((rol) => (
        <label key={rol.id} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            value={rol.id}
            checked={value.includes(rol.id)}
            onChange={(e) => {
              if (e.target.checked) onChange([...value, rol.id])
              else onChange(value.filter((id) => id !== rol.id))
            }}
            className="size-4 accent-primary"
          />
          <span className="text-sm">{rol.nombre}</span>
        </label>
      ))}
    </>
  )
}

function SeccionHeader({ icon, titulo }: { icon: React.ReactNode; titulo: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
      {icon}
      {titulo}
    </h4>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface UsuarioFormDialogProps {
  open: boolean
  onClose: () => void
  usuario?: UsuarioItem | null
  onSuccess: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function UsuarioFormDialog({ open, onClose, usuario, onSuccess }: UsuarioFormDialogProps) {
  const {
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
  } = useUsuarioForm({ open, usuario, onClose, onSuccess })

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        {/* ── Header ── */}
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            {esEdicion ? (
              <div className={`size-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${avatarClases(usuario!)}`}>
                {iniciales(usuario!)}
              </div>
            ) : (
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="size-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-base">
                {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
              </DialogTitle>
              {esEdicion && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {nombreCompleto} · @{usuario!.usuario}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {esEdicion ? (
          /* ── Editar ──────────────────────────────────────────────────────── */
          <Form {...editarForm}>
            <form onSubmit={editarForm.handleSubmit(onSubmitEditar)}>
              <div className="space-y-5 max-h-[60vh] overflow-y-auto px-1">

                {/* Información personal */}
                <section className="space-y-3">
                  <SeccionHeader icon={<UserPen className="size-3.5 text-blue-500 dark:text-blue-400" />} titulo="Información personal" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <CreditCard className="size-3 text-blue-500 dark:text-blue-400 opacity-60" />
                        Tipo / Nro. documento
                      </label>
                      <Input value={`${usuario!.persona.tipoDocumento}: ${usuario!.persona.nroDocumento}`} disabled className="bg-muted/40" />
                    </div>
                    <FormField
                      control={editarForm.control}
                      name="nombres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Nombres</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editarForm.control}
                      name="primerApellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Primer apellido</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editarForm.control}
                      name="segundoApellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Segundo apellido</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editarForm.control}
                      name="fechaNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-blue-500 dark:text-blue-400" />
                            Fecha de nacimiento
                          </FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editarForm.control}
                      name="genero"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs text-muted-foreground">Género</FormLabel>
                          <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {catalogoGenero.map((g) => (
                                <SelectItem key={g.codigo} value={g.codigo}>{g.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* Contacto */}
                <section className="space-y-3">
                  <SeccionHeader icon={<Mail className="size-3.5 text-sky-500 dark:text-sky-400" />} titulo="Contacto" />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={editarForm.control}
                      name="correoElectronico"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3 text-sky-500 dark:text-sky-400" />
                            Correo electrónico
                          </FormLabel>
                          <FormControl><Input type="email" placeholder="correo@ejemplo.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editarForm.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="size-3 text-emerald-500 dark:text-emerald-400" />
                            Teléfono
                          </FormLabel>
                          <FormControl><Input type="tel" placeholder="Ej. 70012345" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* Roles */}
                <section className="space-y-3">
                  <SeccionHeader icon={<ShieldCheck className="size-3.5 text-amber-500 dark:text-amber-400" />} titulo="Roles asignados" />
                  <FormField
                    control={editarForm.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto bg-muted/20">
                            <RolesCheckboxList
                              roles={roles}
                              loading={loadingRoles}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>

              <DialogFooter className="mt-5">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={editarForm.formState.isSubmitting}>
                  {editarForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          /* ── Crear ───────────────────────────────────────────────────────── */
          <Form {...crearForm}>
            <form onSubmit={crearForm.handleSubmit(onSubmitCrear)}>
              <div className="space-y-5 max-h-[60vh] overflow-y-auto px-1">

                {/* Información personal */}
                <section className="space-y-3">
                  <SeccionHeader icon={<UserPlus className="size-3.5 text-blue-500 dark:text-blue-400" />} titulo="Información personal" />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={crearForm.control}
                      name="persona.nombres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Nombres</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.primerApellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Primer apellido</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.segundoApellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Segundo apellido</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.tipoDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <CreditCard className="size-3 text-blue-500 dark:text-blue-400" />
                            Tipo de documento
                          </FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {catalogoTipoDoc.map((t) => (
                                <SelectItem key={t.codigo} value={t.codigo}>{t.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.nroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <CreditCard className="size-3 text-blue-500 dark:text-blue-400" />
                            Nro. documento
                          </FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.fechaNacimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3 text-blue-500 dark:text-blue-400" />
                            Fecha de nacimiento
                          </FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.genero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Género</FormLabel>
                          <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {catalogoGenero.map((g) => (
                                <SelectItem key={g.codigo} value={g.codigo}>{g.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* Contacto */}
                <section className="space-y-3">
                  <SeccionHeader icon={<Mail className="size-3.5 text-sky-500 dark:text-sky-400" />} titulo="Contacto" />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={crearForm.control}
                      name="correoElectronico"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3 text-sky-500 dark:text-sky-400" />
                            Correo electrónico
                          </FormLabel>
                          <FormControl><Input type="email" placeholder="correo@ejemplo.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={crearForm.control}
                      name="persona.telefono"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="size-3 text-emerald-500 dark:text-emerald-400" />
                            Teléfono
                          </FormLabel>
                          <FormControl><Input type="tel" placeholder="Ej. 70012345" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator />

                {/* Roles */}
                <section className="space-y-3">
                  <SeccionHeader icon={<ShieldCheck className="size-3.5 text-amber-500 dark:text-amber-400" />} titulo="Roles asignados" />
                  <FormField
                    control={crearForm.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto bg-muted/20">
                            <RolesCheckboxList
                              roles={roles}
                              loading={loadingRoles}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>

              <DialogFooter className="mt-5">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={crearForm.formState.isSubmitting || loadingRoles}>
                  {crearForm.formState.isSubmitting ? 'Creando...' : 'Crear usuario'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
