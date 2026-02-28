# Frontend Guidelines

## Contexto del proyecto
- Frontend en React + TypeScript
- Entry point: `main.tsx`
- UI escrita exclusivamente en archivos `.tsx`
- Frontend ligero, rápido y mantenible

## Estructura global
- `constants/`: valores inmutables compartidos
- `types/`: tipos y contratos globales
- Cada feature vive en su propio módulo

## Principios de diseño
- SOLID obligatorio
- DRY: no duplicar lógica
- Evitar sobre-abstracción
- Código pensado para crecer

## React
- Componentes funcionales pequeños
- JSX limpio, sin lógica de negocio
- Lógica compleja en hooks
- Estado local solo cuando es necesario

## TypeScript
- Tipado estricto
- Prohibido `any`
- Tipos reutilizables fuera de componentes
- Preferir tipos derivados

## Performance
- Evitar renders innecesarios
- No lógica costosa en render
- Lazy loading cuando aplique
- Evitar librerías pesadas

## Antipatrones prohibidos
- Componentes gigantes
- Hooks con múltiples responsabilidades
- Props drilling innecesario
- Estados duplicados
- Copiar/pegar código

## Regla final
Priorizar siempre:
1. Claridad
2. Mantenibilidad
3. Performance