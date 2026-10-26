# Registo de atividade

O painel `/admin/logs` é reservado a administradores. Inclui filtros, paginação e detalhes antes/depois. Não permite alterar ou apagar eventos. A verificação de acesso existe no proxy e na própria página.

## Ativação

1. Gerar o cliente com `npx prisma generate`.
2. Rever o destino com `npx prisma migrate status`.
3. Aplicar a migração `20261025000000_add_audit_log` com `npx prisma migrate deploy` no ambiente autorizado.
4. Compilar e reiniciar a aplicação.

Neste projeto, `PRISMA_TARGET=prod` carrega `.env.production.local`. Confirmar o ambiente antes de executar. A migração foi aplicada na base partilhada após autorização explícita do proprietário; a verificação confirmou cobertura das 44 tabelas atuais e proteção do histórico ativa. Em ambientes ainda sem migração, o painel apresenta “A aguardar ativação” e os eventos explícitos de acesso/upload não são gravados; as funcionalidades anteriores continuam disponíveis. Não existe reconstrução retroativa de eventos.

## Cobertura e funcionamento

- Triggers PostgreSQL registam INSERT, UPDATE e DELETE de todas as tabelas atuais da aplicação, incluindo traduções, contas, grupos, permissões, contactos, mensagens e subscritores. Operações em lote e cascatas geram um evento por registo.
- O log participa na mesma transação da alteração: um erro reverte ambos. Atualizações sem alterações efetivas, exceto `updatedAt`, não geram eventos.
- O cliente partilhado em `src/lib/prisma.ts` atribui o utilizador autenticado à transação. Suporta escritas diretas, `$transaction([...])` e `$transaction(callback)`. O contexto é local à transação e não passa para o próximo utilizador da ligação.
- Escritas por SQL externo ou clientes fora deste wrapper continuam registadas, com origem SYSTEM e sem autor, salvo configuração explícita do contexto. Leituras e navegação não são eventos de alteração. Falhas de validação não são alterações persistidas.
- Logins efetuados/falhados, bloqueios do formulário de login e saídas têm eventos próprios. Uploads diretos registam quem autorizou o envio e um evento de conclusão sem transmitir dados pessoais ao serviço de ficheiros. As duas entradas podem ser associadas pelo caminho do ficheiro; um envio abandonado só tem autorização.
- As fotografias do autor ficam independentes da conta original, para sobreviverem à sua eliminação. O histórico contém dados pessoais e deve ficar restrito aos administradores.
- Palavras-passe, chaves, tokens e campos sensíveis são ocultados recursivamente por nome. Corpos/snippets de emails também são ocultados. Strings longas e coleções são abreviadas. O histórico não é uma cópia de segurança integral nem um registo de erros do servidor.
- UPDATE, DELETE e TRUNCATE em AuditLog são bloqueados por trigger. Um proprietário da base com privilégios suficientes pode modificar/desativar triggers; não há garantia contra esse acesso privilegiado.

Ao adicionar novas tabelas em futuras migrações, executar no fim dessa migração:

```sql
SELECT apice_install_audit_triggers();
```

Novas operações que usem o cliente base diretamente precisam de análise de atribuição. Eventos explícitos não devem receber palavras-passe, tokens, URLs assinados ou conteúdos privados como identificador.

## Verificação isolada

Os testes só aceitam uma base local descartável chamada `audit_test`; nunca uma ligação remota. Aplicar primeiro as migrações nessa base e definir `AUDIT_TEST_DATABASE_URL`, depois executar:

```text
npx tsx --test tests/audit.integration.test.ts
```

Cobrem instalação dos triggers, credenciais ocultas, autoria, operações aninhadas/em lote, cascatas, rollback, concorrência, ausência de fuga de contexto e proteção do histórico.
