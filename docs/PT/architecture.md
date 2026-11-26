# Arquitetura

Visão geral da estrutura do projeto, como os componentes se ligam entre si e como os dados fluem desde o servidor até à interface.

## Fluxo de dados

O carregamento de uma página do explorador segue este percurso:

```
Browser → page.tsx (server) → getStructure (server action) → Tabular API
                                      ↓
                              estrutura carregada
                                      ↓
                            ExplorerProviders (client)
                            ├── TranslationProvider
                            ├── ResourceProvider
                            │   ├── lê search params do URL
                            │   ├── inicializa filtros, vista ativa e estado
                            │   └── chama getData (server action) → Tabular API
                            └── ChartProvider
                                ├── estado dos eixos e tipo de gráfico
                                └── sincroniza com o URL via setExtraUrlParams
```

A estrutura é carregada no servidor porque é obrigatória para renderizar a página. Se falhar com 404, mostra a página de recurso não encontrado. Se falhar com outro erro, lança a mensagem para o error boundary. Os dados são carregados no cliente porque dependem de filtros, paginação e ordenação que o utilizador controla.

## Providers

### ResourceProvider

É o provider central e o único dono do estado da exploração. Em vez de um contexto grande, expõe esse estado através de quatro contextos especializados, cada um com uma responsabilidade própria e um hook em `src/hooks/`. Assim, um componente só volta a renderizar quando muda a parte que realmente consome: a paginação, por exemplo, não provoca renders em quem só lê a estrutura.

Os contextos estão aninhados pela ordem Data, Pagination, View, Filters. Os componentes não usam os contextos diretamente, usam sempre o hook respetivo, que lança um erro se for chamado fora do `ResourceProvider`.

#### DataContext (`useDataContext`)

Os dados do recurso e o estado do pedido:

- `resourceId` e `structure` (recebida como prop do server)
- `data`, `isLoadingData` e `errorData`
- `loadData`, que volta a pedir os dados com os filtros, a ordenação e a página aplicados
- `total` (registos do recurso) e `totalFiltered` (registos depois de filtrar)

Os pedidos correm dentro de um `useTransition`, que fornece o `isLoadingData`. Em caso de erro, o provider guarda a mensagem em `errorData` e mostra um toast.

Consumido por: quase todos os componentes do explorador, incluindo as quatro vistas, o `ChartProvider` e o `LoadingWrapper`.

#### PaginationContext (`usePaginationContext`)

A posição na tabela e no gráfico, e a ordenação:

- `page` (base 1) e `pageSize`, usados na tabela
- `chartPage`, usado no gráfico, que tem a sua própria paginação
- `sortColumn` e `sortDirection`

Consumido por: `TableView` e `ChartPagination`.

#### ViewContext (`useViewContext`)

A apresentação do explorador:

- `view`: tabela, estrutura, métricas ou gráfico
- `isFullscreen`, `explorerContainerRef` e `toggleFullscreen`, o ecrã inteiro aplicado a todo o explorador
- `setExtraUrlParams`, a porta de entrada para outros providers escreverem no URL (ver abaixo)

Consumido por: `Explorer`, `ExplorerActions`, `ChartView`, `ChartRenderer` e `ChartProvider`.

#### FiltersContext (`useFiltersContext`)

Os filtros e as colunas visíveis:

- `filters`, `filtersOperator` e `headersVisibility`, que são o estado da UI e mudam enquanto o utilizador edita
- `appliedFilters` e `appliedHeadersVisibility`, os valores realmente enviados à API
- `invalidFilters`, que bloqueia a aplicação quando a validação falha
- as ações `applyFilters`, `clearFilters` e `removeFilter`

A distinção entre estado e valores aplicados é importante. O pedido à API só usa os refs (`appliedFilters`, `appliedFiltersOperator`, `appliedHeadersVisibility`), que são atualizados quando o utilizador clica em "Aplicar filtros". Isto evita pedidos desnecessários durante a edição. Aplicar ou limpar filtros volta sempre à primeira página, tanto da tabela como do gráfico.

Consumido por: os componentes de `Explorer/Filters/`, o `TableView` e o `DataNumbers`.

#### Sincronização com o URL

O URL é atualizado automaticamente quando `page`, `pageSize`, `chartPage`, `sortColumn`, `sortDirection` ou `view` mudam, e quando os filtros são aplicados. É uma escrita feita pelo `ResourceProvider` a partir do estado de todos os contextos, por isso é a única parte que os atravessa.

Recebe o `locale` como prop para o passar às server actions, que precisam dele para devolver mensagens de erro traduzidas.

#### Parâmetros extra no URL

O ResourceProvider é o único responsável por escrever no URL. Outros providers que precisem de persistir estado no URL fazem-no através de `setExtraUrlParams`, uma função com identidade estável exposta no ViewContext. Esta função recebe um objecto chave-valor e guarda-o num ref interno. Quando o URL é reconstruído, estes parâmetros são incluídos juntamente com os do próprio ResourceProvider.

O mecanismo usa refs intermediários (`setUrlParamsRef`, `isReadyRef`) para garantir que o `setExtraUrlParams` não depende do ciclo de vida do `setUrlParams` nem causa re-renders desnecessários.

Na leitura inicial do URL, os parâmetros do gráfico são reconhecidos e guardados no ref antes de qualquer escrita, evitando que sejam apagados do URL enquanto o ChartProvider ainda não montou.

### ChartProvider

Gere o estado específico do gráfico, separado do ResourceProvider para não poluir o contexto global. Lê os dados através do `useDataContext` e escreve no URL através do `useViewContext`:

- **Eixos** - `xAxisKey`, `yAxisKeys` (array para múltiplos datasets), `rAxisKey`
- **Colunas disponíveis** - `keys` (todas as colunas) e `numericKeys` (apenas `int` e `float`), que definem o que cada eixo aceita
- **Tipo** - `chart` (Line, Bar, Radar, etc.)
- **Multi-dataset** - `multipleDatasets` (desativado para Doughnut, Pie, Polar Area)
- **Exportação** - `chartRef` para capturar o canvas e exportar como PNG com fundo branco

O ecrã inteiro não é gerido aqui. É da responsabilidade do ViewContext e aplica-se a toda a área do explorador, em qualquer vista.

O estado inicial é lido dos search params do URL. O tipo de gráfico assume `Line` como valor por defeito quando não existe no URL. Os eixos começam sem seleção e são validados quando os dados carregam: o eixo X tem de existir no dataset e os eixos Y e de raio têm de ser colunas numéricas. Se um eixo vindo do URL não cumprir isto, é limpo em vez de substituído automaticamente. Ao mudar para um tipo de gráfico de dataset único, só o primeiro eixo Y é mantido.

Quando o tipo de gráfico, os eixos ou o eixo de raio mudam, o ChartProvider sincroniza o estado com o URL chamando `setExtraUrlParams` do ResourceProvider. O eixo de raio só é incluído quando o tipo de gráfico o utiliza (bolhas).

### TranslationProvider

Inicializa o `react-i18next` no lado do cliente com o locale e recursos carregados.

## Layout

O layout em `src/app/[locale]/layout.tsx` envolve todas as páginas com o `TranslationProvider`, o `Header` e o `Footer`. O cabeçalho inclui o seletor de idioma, que mantém o resto do caminho e troca apenas o prefixo do locale. Cada página abre com um `Hero`, que contém o título e as breadcrumbs. Na página do explorador as breadcrumbs são apenas informativas (`isNonClickable`), porque a aplicação não tem página inicial para onde voltar.

## Componentes Shared

Os componentes em `src/components/Shared/` são wrappers finos sobre o Agora Design System. Cada um importa o componente original e re-exporta-o, permitindo:

- Centralizar customizações e overrides
- Manter os imports consistentes no projeto
- Facilitar a substituição do design system no futuro

Não contêm lógica de negócio, com uma exceção: o `InputSelect` mantém um estado interno sincronizado com a prop `value` via `useEffect` para contornar um bug do Agora Design System que causa `setState` durante o render quando o valor muda.

## Server Actions

As server actions em `actions.ts` são funções `"use server"` que fazem fetch à Tabular API. Recebem o `locale` como primeiro argumento para devolver mensagens de erro traduzidas via `initTranslations`.

O endereço da API vem da variável de ambiente `TABULAR_API_URL`, lida em `next.config.ts`, no formato `host:porta` e sem protocolo. As actions acrescentam `http://`. Sem a variável, usa `127.0.0.1:8005`.

```
getData(locale, resourceId, page, pageSize, sortCol, sortOrder, headers, filtersOperator, filters, columns)
  → GET /api/resources/{id}/data/?{queryParams}
  → retorna { status, data?, error?, errors? }

getStructure(locale, resourceId)
  → GET /api/resources/{id}/profile/
  → retorna { status, data?, error?, errors? }
```

Ambas tratam erros de rede, 404, e erros de validação da API de forma uniforme, devolvendo sempre um objecto com `status` em vez de lançar exceções. O tratamento de 404 é explícito e anterior à verificação genérica de `!response.ok`.

## Validação de filtros

A validação usa Zod e corre no cliente antes de enviar o pedido à API. O hook `useFilterValidation` constrói um schema dinâmico com base na estrutura do dataset:

1. Para cada coluna, lê o `format` e o `python_type` do `structure.profile.columns`
2. O `format` tem prioridade sobre o `python_type` (ex: `year` sobre `int`)
3. Operadores `isnull` e `isnotnull` aceitam qualquer valor
4. Os erros são devolvidos por campo e mostrados no input correspondente
5. Filtros com valor vazio ou `undefined` são aceites (campos opcionais)

A referência de formatos conhecidos está documentada em `docs/data-formats.md`.

## Vistas

O componente `Explorer` usa um `ExplorerView` que renderiza a vista ativa. A vista selecionada é gerida pelo ResourceProvider e persistida no URL através do parâmetro `view`:

- **Tabela** - `TableView` com `TableHeader`, `TableBody`, `TableRowNoResults`
- **Estrutura** - `StructureView` com cards de stats e lista de campos com score de confiança
- **Métricas** - `MetricsView` com alertas de qualidade, sumário global e cards por coluna
- **Gráfico** - `ChartView` com `ChartSelectors`, `ChartRenderer`, `ChartPagination`

As ações disponíveis mudam conforme a vista ativa:

- **Tabela** - exportar CSV (dados da página atual)
- **Estrutura** - exportar JSON (`buildStructureExportData`)
- **Métricas** - exportar JSON (`buildMetricsExportData`)
- **Gráfico** - exportar PNG
- **Todas** - ecrã inteiro, aplicado ao contentor do explorador (`explorerContainerRef`)

Os botões de exportação ficam desativados enquanto não houver dados carregados.

### Ordenação da tabela

Cada clique no cabeçalho de uma coluna percorre três estados: crescente, decrescente e sem ordenação. A ordenação ativa é guardada no URL como `{coluna}__sort=asc|desc`, e só pode existir uma coluna ordenada de cada vez. O tipo de ordenação (`string`, `numeric` ou `date`) vem de `getSortType`, que segue a mesma prioridade do `format` sobre o `python_type`. Nas colunas numéricas e de datas os ícones do Agora Design System estão trocados, por isso o `TableHeader` inverte a ordem apenas para mostrar o ícone correto, sem alterar a ordem enviada à API.

## Parâmetros do URL

O estado do explorador vive no URL, o que permite partilhar uma consulta exata. Os parâmetros reservados estão em `src/services/consts/urlParams.ts`:

| Parâmetro | Descrição |
| --------- | --------- |
| `view` | Vista ativa: `table`, `chart`, `structure` ou `metrics` |
| `page`, `page_size` | Página da tabela (base 1) e linhas por página (10, 50 ou 200) |
| `columns` | Colunas visíveis, separadas por vírgula. Omitido quando todas estão visíveis |
| `{coluna}__{operador}` | Filtro aplicado, por exemplo `ano__exact=2020` ou `nome__contains=lisboa` |
| `{coluna}__sort` | Ordenação por essa coluna, `asc` ou `desc` |
| `chart` | Tipo de gráfico |
| `chart_x`, `chart_y`, `chart_r` | Colunas dos eixos X, Y (várias, separadas por vírgula) e de raio |
| `chart_page` | Página do gráfico (base 1) |

Os filtros `isnull` e `isnotnull` não têm valor. Valores inválidos de `view`, `page_size` ou `chart` são ignorados e substituídos pelos valores por defeito.

## Gestão de erros

A hierarquia de error boundaries segue a estrutura de rotas do Next.js:

```
global-error.tsx                           ← erros no root layout (inclui <html> e <body>)
not-found.tsx                              ← 404 sem locale, redireciona para [locale]/not-found
[locale]/error.tsx                         ← erros genéricos com i18n
[locale]/not-found.tsx                     ← 404 com i18n
[locale]/not-found/page.tsx                ← destino do redirecionamento, chama notFound()
explorer/[resource_id]/error.tsx           ← erros do explorador (mostra error.message)
explorer/[resource_id]/not-found.tsx       ← recurso não encontrado na API
```

Cada nível apanha erros do seu segmento e dos filhos. O 404 raiz redireciona para `/{locale}/not-found`, escolhendo o locale pelo cookie `locale` e, na falta dele, pelo `Accept-Language`.

As páginas de erro usam o componente `StatusPage` (`ErrorPage` e `NotFoundPage` são variantes dele). O `global-error.tsx` substitui o root layout, por isso não tem acesso ao `TranslationProvider` normal: importa os ficheiros `common.json` diretamente e lê o locale do URL. O erro do explorador regista também o `resource_id` no log.

## Internacionalização

O projeto usa `react-i18next` no cliente e `initTranslations` no servidor. A configuração está em `src/config/i18nConfig.ts`. Os namespaces são:

- **common** - textos partilhados (cabeçalho, botões, páginas de erro, erros da API)
- **explorer** - textos específicos do explorador (vistas, filtros, métricas, gráficos, validação)
- **footer** - textos do rodapé

Os idiomas suportados são `pt` e `en`, com `pt` por defeito. O roteamento por locale é feito em `src/proxy.ts` com `next-i18n-router`, e o prefixo é sempre obrigatório (`prefixDefault: true`). Os números são formatados com espaço como separador de milhares.

As server actions recebem o `locale` como argumento e inicializam a sua própria instância de i18n porque a função `t` do cliente não é serializável e não pode ser passada como argumento.

## Paginação

A API usa paginação base 1 (`INITIAL_PAGE = 1`). A tabela do Agora Design System usa base 0. A conversão é feita no `TableView`:

- `currentPage: page - 1` - ao passar para o componente (base 1 → base 0)
- `setPage(tablePage + 1)` - ao receber o callback (base 0 → base 1)

O `ChartPagination` trabalha directamente em base 1.

A tabela e o gráfico têm paginações independentes. A tabela usa `page` e `pageSize` (10, 50 ou 200). O gráfico usa `chartPage` e um tamanho fixo de 1000 registos (`CHART_PAGE_SIZE`). O pedido à API usa uma ou outra consoante a vista ativa.

## Testes

Os testes usam Vitest com Testing Library e ficam em `__tests__/`, numa estrutura que espelha `src/`. Cobrem os providers, o hook de validação de filtros, as server actions, os utilitários de dados, de URL e de exportação. Os dados de exemplo partilhados estão em `__tests__/mock-data.ts`. Para correr: `npm test`.

## Documentação

- [README](../../README.md) - descrição geral do projeto
- [Arquitetura](architecture.md) - fluxo de dados, providers, server actions, parâmetros do URL, validação e gestão de erros
- [Tipos e formatos de dados](data-formats.md) - referência dos formatos devolvidos pela Tabular API e como são validados

## ENglish Version

- [README](../EN/README.md) - general project overview
- [Arquitetura](../EN/architecture.md) - data flow, providers, server actions, URL parameters, validation, and error handling
- [Tipos e formatos de dados](../EN/data-formats.md) - reference for formats returned by the Tabular API and how they are validated
