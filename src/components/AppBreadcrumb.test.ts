import { describe, it, expect } from 'vitest'
import { buildCrumbs } from './AppBreadcrumb'

describe('buildCrumbs', () => {
  it('retorna array vacío para la ruta raíz', () => {
    expect(buildCrumbs('/')).toEqual([])
  })

  it('genera un crumb para rutas de un nivel', () => {
    const crumbs = buildCrumbs('/usuarios')
    expect(crumbs).toHaveLength(1)
    expect(crumbs[0]).toMatchObject({ label: 'Usuarios', path: '/usuarios', last: true, navigable: true })
  })

  it('marca el último segmento como last:true', () => {
    const crumbs = buildCrumbs('/cuenta/contrasena')
    expect(crumbs[crumbs.length - 1].last).toBe(true)
    expect(crumbs.slice(0, -1).every((c) => !c.last)).toBe(true)
  })

  it('marca segmentos no navegables correctamente', () => {
    const crumbs = buildCrumbs('/cuenta/contrasena')
    const cuentaCrumb = crumbs.find((c) => c.path === '/cuenta')
    expect(cuentaCrumb?.navigable).toBe(false)
  })

  it('segmentos navegables tienen navigable:true', () => {
    const crumbs = buildCrumbs('/cuenta/contrasena')
    const contrasenaCrumb = crumbs.find((c) => c.path === '/cuenta/contrasena')
    expect(contrasenaCrumb?.navigable).toBe(true)
  })

  it('construye paths acumulativos correctamente', () => {
    const crumbs = buildCrumbs('/cuenta/contrasena')
    expect(crumbs[0].path).toBe('/cuenta')
    expect(crumbs[1].path).toBe('/cuenta/contrasena')
  })

  it('usa el segmento literal como label para rutas desconocidas', () => {
    const crumbs = buildCrumbs('/modulo-desconocido')
    expect(crumbs[0].label).toBe('modulo-desconocido')
  })

  it('traduce correctamente todas las rutas conocidas', () => {
    const casos: [string, string][] = [
      ['/dashboard',        'Dashboard'],
      ['/usuarios',         'Usuarios'],
      ['/roles',            'Roles'],
      ['/parametros',       'Parámetros'],
      ['/perfil',           'Perfil'],
    ]
    for (const [path, label] of casos) {
      const crumbs = buildCrumbs(path)
      expect(crumbs[0].label).toBe(label)
    }
  })
})
