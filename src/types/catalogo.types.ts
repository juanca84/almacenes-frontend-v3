export interface CatalogoItem {
  codigo: string
  nombre: string
}

export interface Catalogo {
  TDOC: CatalogoItem[]
  [key: string]: CatalogoItem[]
}
