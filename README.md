# Lytex Front

Aplicacao front-end em Angular para autenticacao de usuarios e gestao de cobrancas.

## Visao geral

- Stack principal: Angular 21, Angular Material e RxJS.
- Fluxos principais: login, cadastro, dashboard e listagem/acao de cobrancas.
- Seguranca: `authGuard` para proteger rotas e `authInterceptor` para enviar token Bearer.

## Requisitos

- Node.js LTS (recomendado: 20+)
- npm (o projeto usa `npm@10.8.2`)

## Instalacao

```bash
npm install
```

## Executando o projeto

```bash
npm start
```

- A aplicacao sobe em `http://localhost:4200/` por padrao.
- A API base local esta configurada em `src/environments/environment.ts` como `http://localhost:3000`.

## Scripts disponiveis

- `npm start`: inicia servidor de desenvolvimento (`ng serve`).
- `npm run build`: gera build de producao em `dist/`.
- `npm run watch`: build em modo watch para desenvolvimento.
- `npm test`: executa testes unitarios.

## Estrutura do projeto

```text
src/
  app/
	core/
	  guards/
	  interceptors/
	  services/
	features/
	  auth/
		components/
		pages/
	app.routes.ts
  environments/
	environment.ts
```

## Ambiente e configuracao

- Arquivo de ambiente atual: `src/environments/environment.ts`.
- Campo principal: `apiUrl`, utilizado para chamadas HTTP ao backend.
- Antes de subir em homologacao/producao, ajuste a URL da API conforme o ambiente.

## Build e deploy

```bash
npm run build
```

- O artefato final fica em `dist/`.
- Configure o servidor web para servir SPA (fallback para `index.html`).

## Tecnologias

- Angular
- Angular Material
- TypeScript
