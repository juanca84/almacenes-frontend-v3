# Feature Validation Checklist

## Arquitectura
- [ ] El feature vive en su propia carpeta
- [ ] No hay componentes con múltiples responsabilidades
- [ ] La estructura es clara y consistente

## Reutilización
- [ ] No hay lógica duplicada
- [ ] Hooks reutilizados cuando aplica
- [ ] Helpers y utils bien aislados

## TypeScript
- [ ] No se usa `any`
- [ ] Props y hooks están tipados explícitamente
- [ ] Tipos reutilizados desde `types/`

## Constantes
- [ ] Valores reutilizados desde `constants/`
- [ ] No hay strings mágicos en el código

## React & Performance
- [ ] No hay lógica pesada en JSX
- [ ] No hay renders innecesarios
- [ ] No se agregaron dependencias pesadas sin justificación
- [ ] `useMemo` / `useCallback` solo donde aportan valor

## Calidad
- [ ] Código legible y fácil de mantener
- [ ] Nombres claros y semánticos
- [ ] Edge cases considerados