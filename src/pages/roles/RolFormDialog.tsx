import { ShieldCheck, ShieldPlus } from 'lucide-react'

import { useModulosStore } from '@/store/modulos.store'
import { formatearIdentificador } from '@/constants/roles'
import type { RolItem } from '@/types/roles.types'
import { useRolForm } from './hooks/useRolForm'
import { ModuloArbol } from './components/ModuloArbol'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

// ── Props ─────────────────────────────────────────────────────────────────────

interface RolFormDialogProps {
  open: boolean
  onClose: () => void
  rol?: RolItem | null
  onSuccess: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function RolFormDialog({ open, onClose, rol, onSuccess }: RolFormDialogProps) {
  const { modulos, loading: loadingModulos } = useModulosStore()

  const {
    esEdicion,
    crearForm,
    editarForm,
    loadingModulosRol,
    onSubmitCrear,
    onSubmitEditar,
    onClose: handleClose,
  } = useRolForm({ open, rol, onClose, onSuccess })

  // Preview en tiempo real del identificador formateado
  const rolRaw = crearForm.watch('rol')
  const preview = rolRaw ? formatearIdentificador(rolRaw) : ''

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        {/* ── Header ── */}
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {esEdicion
                ? <ShieldCheck className="size-5 text-primary" />
                : <ShieldPlus className="size-5 text-primary" />
              }
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base">
                {esEdicion ? `Editar rol` : 'Nuevo rol'}
              </DialogTitle>
              {esEdicion && (
                <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                  {rol!.rol}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {esEdicion ? (
          /* ── Editar ─────────────────────────────────────────────────────── */
          <Form {...editarForm}>
            <form onSubmit={editarForm.handleSubmit(onSubmitEditar)}>
              <div className="space-y-5 max-h-[65vh] overflow-y-auto px-1">

                {/* Identificador (solo lectura) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Identificador
                  </label>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 h-9">
                    <span className="text-sm font-mono text-muted-foreground">{rol!.rol}</span>
                    <span className="ml-auto text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                      inmutable
                    </span>
                  </div>
                </div>

                {/* Nombre */}
                <FormField
                  control={editarForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Nombre legible <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Supervisor de almacén" {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Árbol de módulos */}
                <FormField
                  control={editarForm.control}
                  name="modulos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Permisos por módulo{' '}
                        <span className="text-muted-foreground/60">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="border rounded-lg px-2 pb-2 bg-muted/10 max-h-64 overflow-y-auto">
                          <ModuloArbol
                            modulos={modulos}
                            value={field.value}
                            onChange={field.onChange}
                            loading={loadingModulos || loadingModulosRol}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-5">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editarForm.formState.isSubmitting || loadingModulosRol}
                >
                  {editarForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          /* ── Crear ──────────────────────────────────────────────────────── */
          <Form {...crearForm}>
            <form onSubmit={crearForm.handleSubmit(onSubmitCrear)}>
              <div className="space-y-5 max-h-[65vh] overflow-y-auto px-1">

                {/* Identificador + preview */}
                <FormField
                  control={crearForm.control}
                  name="rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Identificador <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. supervisor almacen"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      {preview && (
                        <p className="text-[11px] text-muted-foreground">
                          Se guardará como:{' '}
                          <span className="font-mono font-semibold text-foreground">
                            {preview}
                          </span>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre */}
                <FormField
                  control={crearForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Nombre legible <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Supervisor de almacén" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Árbol de módulos */}
                <FormField
                  control={crearForm.control}
                  name="modulos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Permisos por módulo{' '}
                        <span className="text-muted-foreground/60">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="border rounded-lg px-2 pb-2 bg-muted/10 max-h-64 overflow-y-auto">
                          <ModuloArbol
                            modulos={modulos}
                            value={field.value}
                            onChange={field.onChange}
                            loading={loadingModulos}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-5">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={crearForm.formState.isSubmitting || loadingModulos}
                >
                  {crearForm.formState.isSubmitting ? 'Creando...' : 'Crear rol'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
