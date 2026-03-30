

## Corrigir tela branca — Duplicate React instance

### Problema
O erro `Cannot read properties of null (reading 'useEffect')` no `QueryClientProvider` indica que o Vite está resolvendo duas instâncias diferentes de React (uma para o app, outra para `@tanstack/react-query`). O `dedupe` atual não é suficiente — precisa de aliases explícitos.

### Solução em `vite.config.ts`

Adicionar aliases explícitos forçando React a resolver sempre do mesmo `node_modules`, e incluir `react`/`react-dom` no `optimizeDeps.include`:

```ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "react": path.resolve(__dirname, "node_modules/react"),
    "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
  },
  dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
},
optimizeDeps: {
  force: true,
  include: ["react", "react-dom"],
},
```

### Arquivo afetado
| Arquivo | Acao |
|---|---|
| `vite.config.ts` | Adicionar aliases para react/react-dom e include no optimizeDeps |

