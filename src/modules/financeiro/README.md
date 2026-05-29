# Módulo Financeiro

Módulo autocontido para o fluxo de pagamentos do apartamento (entrada, INCC, evolução de obra).

## Convenção de nomes de coleção

Todas as coleções Firestore deste módulo seguem o prefixo `financeiro_`:

- `financeiro_config`
- `financeiro_entrada`
- `financeiro_evolucao`
- `financeiro_incc`

## Regra de dependência (via única)

- **Nenhum módulo externo importa de `financeiro`.**
- O módulo `financeiro` só pode importar de:
  - `@/components/*`
  - `@/utils/*`
  - `@/services/firebase`
  - `@/modules/auth/*`
  - Bibliotecas externas já usadas no projeto

## Checklist de remoção

Para remover o módulo completamente do projeto:

1. Apagar `src/modules/financeiro/`
2. Apagar `src/app/financeiro/`
3. Em `src/components/AppLayout.tsx`:
   - Remover o item `{ href: '/financeiro', icon: Receipt, label: 'Financeiro' }` do array `NAV_ITEMS`
   - Remover `Receipt` do import do `lucide-react` (se não usado em outro lugar)
4. Em `firestore.rules`, remover o bloco delimitado por:
   ```
   // === FINANCEIRO (removível) ...
   // === FIM FINANCEIRO ===
   ```
5. (Opcional) Apagar as coleções `financeiro_config`, `financeiro_entrada`, `financeiro_evolucao` e `financeiro_incc` no console do Firestore
