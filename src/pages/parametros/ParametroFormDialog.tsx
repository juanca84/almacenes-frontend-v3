import { AlignLeft, Hash, Layers, PlusCircle, Tag } from 'lucide-react'

import type { ParametroItem } from '@/types/parametro.types'
import { grupoClases, grupoLetra } from '@/lib/parametro'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useParametroForm } from './hooks/useParametroForm'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ParametroFormDialogProps {
  open: boolean
  onClose: () => void
  parametro?: ParametroItem | null
  onSuccess: () => void
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function SeccionHeader({ titulo }: { titulo: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {titulo}
    </h4>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ParametroFormDialog({ open, onClose, parametro, onSuccess }: ParametroFormDialogProps) {
  const {
    esEdicion,
    crearForm,
    editarForm,
    onSubmitCrear,
    onSubmitEditar,
  } = useParametroForm({ open, parametro, onClose, onSuccess })

  // Preview en vivo del icono de grupo mientras se escribe en creación
  const grupoPreview = esEdicion ? parametro?.grupo : crearForm.watch('grupo')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* ── Header ── */}
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            {grupoPreview ? (
              <div className={`size-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${grupoClases(grupoPreview)}`}>
                {grupoLetra(grupoPreview)}
              </div>
            ) : (
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <PlusCircle className="size-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-base">
                {esEdicion ? 'Editar parámetro' : 'Nuevo parámetro'}
              </DialogTitle>
              {esEdicion && (
                <p className="text-sm text-muted-foreground font-mono mt-0.5">
                  {parametro?.codigo}
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

                <section className="space-y-3">
                  <SeccionHeader titulo="Identificación" />

                  {/* Código — inmutable */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hash className="size-3 text-violet-500 dark:text-violet-400" />
                      Código
                    </p>
                    <Input value={parametro?.codigo} disabled className="bg-muted/40 font-mono" />
                    <p className="text-[11px] text-muted-foreground/70">
                      El código no puede modificarse una vez creado.
                    </p>
                  </div>

                  <FormField
                    control={editarForm.control}
                    name="grupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                          <Layers className="size-3 text-emerald-500 dark:text-emerald-400" />
                          Grupo <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej. TD"
                            maxLength={15}
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <Separator />

                <section className="space-y-3">
                  <SeccionHeader titulo="Detalle" />

                  <FormField
                    control={editarForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag className="size-3 text-blue-500 dark:text-blue-400" />
                          Nombre <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej. Cédula de identidad" maxLength={50} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editarForm.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlignLeft className="size-3 text-slate-500 dark:text-slate-400" />
                          Descripción <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder="Descripción del parámetro..."
                            maxLength={255}
                            rows={3}
                            className={cn(
                              'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                              'ring-offset-background placeholder:text-muted-foreground',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                              'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
                            )}
                          />
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

                <section className="space-y-3">
                  <SeccionHeader titulo="Identificación" />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={crearForm.control}
                      name="grupo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Layers className="size-3 text-emerald-500 dark:text-emerald-400" />
                            Grupo <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. TD"
                              maxLength={15}
                              className="uppercase"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={crearForm.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                            <Hash className="size-3 text-violet-500 dark:text-violet-400" />
                            Código <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej. TD-CI"
                              maxLength={15}
                              className="uppercase font-mono"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">
                    Convención: <span className="font-mono">GRUPO-DISCRIMINADOR</span> (ej: <span className="font-mono">TD-CI</span>)
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <SeccionHeader titulo="Detalle" />

                  <FormField
                    control={crearForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag className="size-3 text-blue-500 dark:text-blue-400" />
                          Nombre <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej. Cédula de identidad" maxLength={50} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={crearForm.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlignLeft className="size-3 text-slate-500 dark:text-slate-400" />
                          Descripción <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder="Descripción del parámetro..."
                            maxLength={255}
                            rows={3}
                            className={cn(
                              'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                              'ring-offset-background placeholder:text-muted-foreground',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                              'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>

              <DialogFooter className="mt-5">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={crearForm.formState.isSubmitting}>
                  {crearForm.formState.isSubmitting ? 'Creando...' : 'Crear parámetro'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
