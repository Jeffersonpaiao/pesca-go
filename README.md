# Pesca GO

MVP navegavel para conectar pescadores a guias, piloteiros, barcos e experiencias de pesca esportiva em Rondonia. A interface foi pensada para funcionar tanto no navegador quanto em telas de celular.

## O que esta incluido

- Pagina inicial responsiva com destinos e atalhos de servico.
- Busca por rio, data e numero de pescadores.
- Lista de parceiros aprovados, valores e avaliacoes.
- Solicitacao de proposta com resumo da experiencia.
- Acompanhamento de proposta, aceite e chat.
- Painel do parceiro com solicitacoes, agenda e indicadores.
- API REST local para rios, prestadores, solicitacoes e mensagens.
- Modelo PostgreSQL para a evolucao do produto.
- Dados demonstrativos de rios e profissionais de Rondonia.

## Como executar

Requisito: Node.js 18 ou mais recente.

```bash
npm start
```

No computador, abra `http://127.0.0.1:4173`. Para testar em um celular conectado ao mesmo Wi-Fi, abra `http://IP-DO-COMPUTADOR:4173`.

Nao ha dependencias para instalar. A API e os arquivos web sao servidos pelo proprio Node.js.

## Testes

```bash
npm test
```

## Publicar para acesso externo

O projeto inclui `render.yaml` e pode ser publicado como um Static Site no Render. Essa modalidade nao adormece por inatividade:

1. Envie esta pasta para um repositorio no GitHub.
2. No Render, crie um novo Blueprint e conecte o repositorio.
3. Confirme o servico `pesca-go` e inicie a publicacao.
4. Ao final, abra a URL HTTPS fornecida pelo Render em qualquer celular ou computador.

Na versao publicada, os dados demonstrativos ficam no armazenamento local de cada navegador. Para uso real e compartilhado, conecte o modelo de `database/schema.sql` a um PostgreSQL.

## Estrutura

```text
public/             Interface web responsiva
database/schema.sql Modelo relacional PostgreSQL
test/               Testes da API e servidor
server.js           Servidor web e API REST do MVP
```

## Rotas da API

- `GET /api/rivers`
- `GET /api/providers?river=guapore`
- `GET /api/requests`
- `POST /api/requests`
- `PATCH /api/requests/:id/status`
- `GET /api/messages?requestId=PG-2408`
- `POST /api/messages`

## Decisoes do MVP

Os dados ficam em memoria e voltam ao estado inicial quando o servidor reinicia. Isso permite validar rapidamente a experiencia sem configurar banco ou credenciais. O arquivo `database/schema.sql` documenta a persistencia planejada para producao.

Mapas, pagamentos, autenticacao, documentos e geolocalizacao real devem entrar na proxima etapa, com provedores externos e regras de seguranca proprias. Antes de publicar, tambem sera necessario validar licenciamento de pesca, periodo de defeso, termos de responsabilidade e politica de cancelamento com os orgaos competentes.
