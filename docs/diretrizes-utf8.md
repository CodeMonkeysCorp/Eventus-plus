# Diretriz de Texto e Encoding

## Regra principal

Todos os arquivos de texto do projeto devem ser salvos em **UTF-8**.

Isso vale para:

- documentação
- templates HTML
- mensagens exibidas no frontend
- mensagens de erro e auditoria no backend
- scripts e textos operacionais
- arquivos de configuração baseados em texto

## Escrita em português

Quando o texto estiver em português, use **acentuação normal do idioma**.

Exemplos corretos:

- `inscrição`
- `presença`
- `autenticação`
- `relatórios`
- `configuração`
- `produção`

Não remover acentos para “evitar problema de encoding”. Se houver problema, a
correção deve ser feita na configuração da ferramenta, não no texto.

## O que continua em ASCII

Identificadores técnicos podem continuar em ASCII quando isso for mais seguro
ou mais convencional, por exemplo:

- nomes de arquivos
- nomes de classes, métodos e variáveis
- rotas e URLs
- nomes de banco, tabelas e colunas
- nomes de variáveis de ambiente
- chaves JSON e contratos técnicos

Exemplo:

- texto exibido: `Minhas inscrições`
- rota técnica: `/minhas-inscricoes`

## Ferramentas

O repositório agora define UTF-8 como padrão em:

- `.editorconfig`
- `.gitattributes`
- `.vscode/settings.json`

## Checklist de revisão

Antes de concluir uma alteração:

1. confirme que o arquivo continua em UTF-8
2. revise textos em português com acentos corretos
3. preserve ASCII apenas em identificadores técnicos
4. não introduza “português sem acentos” em documentação ou UI
