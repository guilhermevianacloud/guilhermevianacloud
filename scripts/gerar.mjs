// Gera os cartões SVG do perfil a partir da API GraphQL do GitHub.
// Uso: GITHUB_TOKEN=... node scripts/gerar.mjs
// Saída: pasta "cartoes/", um arquivo por cartão e por tema (escuro/claro).

import { mkdir, writeFile } from "node:fs/promises";
import { TEMAS, SANS, MONO, esc, moldura, cabecalhoDeCartao } from "./tema.mjs";
import { cartaoBaleia, cartaoNoc } from "./infra.mjs";

const USUARIO = process.env.USUARIO || "guilhermevianacloud";
const TOKEN = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;
const MAX_LINGUAGENS = 7;
// Linguagens que não contam como "código" (separadas por vírgula, ex.: "HTML,CSS").
const IGNORAR = (process.env.IGNORAR_LINGUAGENS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

if (!TOKEN) {
  console.error("Defina GITHUB_TOKEN (ou GH_STATS_TOKEN).");
  process.exit(1);
}

// ---------- dados ----------

async function consultar() {
  const query = `query($login: String!) {
    user(login: $login) {
      createdAt
      pullRequests { totalCount }
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        totalCount
        nodes {
          stargazerCount
          languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
            edges { size node { name color } }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }`;
  const resp = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USUARIO } }),
  });
  const json = await resp.json();
  if (!resp.ok || json.errors) {
    throw new Error(`GitHub respondeu ${resp.status}: ${JSON.stringify(json.errors || json)}`);
  }
  return json.data.user;
}

function linguagens(user) {
  const soma = new Map();
  for (const repo of user.repositories.nodes) {
    for (const { size, node } of repo.languages.edges) {
      if (IGNORAR.includes(node.name.toLowerCase())) continue;
      const atual = soma.get(node.name) || { nome: node.name, cor: node.color || "#8592b0", bytes: 0 };
      atual.bytes += size;
      soma.set(node.name, atual);
    }
  }
  const lista = [...soma.values()].sort((a, b) => b.bytes - a.bytes);
  const total = lista.reduce((t, l) => t + l.bytes, 0) || 1;
  const topo = lista.slice(0, MAX_LINGUAGENS);
  const resto = lista.slice(MAX_LINGUAGENS);
  if (resto.length) {
    topo.push({ nome: `Outras (${resto.length})`, cor: "#8592b0", bytes: resto.reduce((t, l) => t + l.bytes, 0) });
  }
  return { lista: topo.map((l) => ({ ...l, pct: (l.bytes / total) * 100 })), total, quantidade: lista.length };
}

function sequencias(dias) {
  let maior = 0, corrente = 0;
  for (const d of dias) {
    corrente = d.contributionCount > 0 ? corrente + 1 : 0;
    maior = Math.max(maior, corrente);
  }
  // Sequência atual: hoje sem contribuição ainda não quebra a sequência.
  let atual = 0;
  let i = dias.length - 1;
  if (i >= 0 && dias[i].contributionCount === 0) i--;
  for (; i >= 0 && dias[i].contributionCount > 0; i--) atual++;
  return { atual, maior };
}

// ---------- utilidades ----------

const num = (n) => n.toLocaleString("pt-BR");
function tamanho(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024).toLocaleString("pt-BR")} KB`;
  return `${bytes} B`;
}

// ---------- cartões ----------

function cartaoCabecalho(t) {
  const L = 900, A = 250;
  const etapas = ["estudar", "codar", "testar", "revisar", "entregar"];
  const x0 = 80, x1 = 820, y = 196;
  const passo = (x1 - x0) / (etapas.length - 1);
  const ciclo = 9; // segundos
  let estilo = `
  .digita { transform: translateX(560px); animation: digita 3.2s steps(46) 0.4s both; }
  @keyframes digita { from { transform: translateX(0); } to { transform: translateX(560px); } }
  .cursor { animation: pisca 1s step-end infinite; }
  @keyframes pisca { 50% { opacity: 0; } }
  .linha-viva { stroke-dasharray: ${x1 - x0}; animation: corre ${ciclo}s ease-in-out infinite; }
  @keyframes corre { 0% { stroke-dashoffset: ${x1 - x0}; } 70%, 92% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; opacity: 0; } }
  .pulso { transform-box: fill-box; transform-origin: center; animation: pulso 2.4s ease-out infinite; }
  @keyframes pulso { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(2.6); opacity: 0; } }`;
  let nos = "";
  etapas.forEach((nome, i) => {
    const cx = x0 + i * passo;
    const acende = Math.round((i / (etapas.length - 1)) * 70);
    estilo += `
  .no${i} { animation: acende${i} ${ciclo}s ease-in-out infinite; }
  @keyframes acende${i} { 0%, ${Math.max(acende - 1, 0)}% { fill: ${t.fundo}; } ${acende + 2}%, 96% { fill: ${t.passou}; } 100% { fill: ${t.fundo}; } }`;
    nos += `<circle cx="${cx}" cy="${y}" r="10" fill="${t.passou}" stroke="${t.passou}" stroke-width="2.5" class="no${i}"/>
<text x="${cx}" y="${y + 32}" text-anchor="middle" class="mono" font-size="12" fill="${t.mudo}">${nome}</text>`;
  });
  const frase = "> microsoft 365 · intune · redes · java · spring boot";
  const conteudo = `
<circle cx="26" cy="26" r="5.5" fill="#ff5f57"/><circle cx="44" cy="26" r="5.5" fill="#febc2e"/><circle cx="62" cy="26" r="5.5" fill="#28c840"/>
<text x="84" y="30" class="mono" font-size="12" fill="${t.mudo}">pipeline: ${USUARIO} / main</text>
<g transform="translate(${L - 150} 14)">
  <rect width="124" height="24" rx="12" fill="none" stroke="${t.passou}"/>
  <circle cx="16" cy="12" r="4" fill="${t.passou}"/>
  <circle cx="16" cy="12" r="4" fill="${t.passou}" class="pulso"/>
  <text x="28" y="16.5" class="mono" font-size="12" fill="${t.passou}">em construção</text>
</g>
<text x="40" y="94" class="sans" font-size="40" font-weight="700" fill="${t.texto}">Guilherme Viana</text>
<text x="42" y="124" class="sans" font-size="16" fill="${t.mudo}">Análise e Desenvolvimento de Sistemas · Senac  ·  Assistente de Tecnologia | Infraestrutura</text>
<g>
  <text x="42" y="156" class="mono" font-size="15" fill="${t.destaque}">${esc(frase)}</text>
  <rect x="38" y="140" width="560" height="22" fill="${t.fundo}" class="digita"/>
</g>
<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${t.trilha}" stroke-width="4" stroke-linecap="round"/>
<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${t.passou}" stroke-width="4" stroke-linecap="round" class="linha-viva"/>
${nos}`;
  return moldura(t, L, A, "Guilherme Viana — pipeline do perfil", conteudo, estilo);
}

function cartaoLinguagens(t, ling, altura) {
  const L = 440;
  const xBarra = 24, largBarra = L - 48;
  let estilo = `
  .cresce { transform-box: fill-box; transform-origin: left; animation: cresce 1.1s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes cresce { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .surge { animation: surge .5s ease-out both; }
  @keyframes surge { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`;
  // Barra empilhada no topo.
  let x = xBarra, empilhada = "";
  ling.lista.forEach((l) => {
    const w = (l.pct / 100) * largBarra;
    empilhada += `<rect x="${x.toFixed(2)}" y="58" width="${Math.max(w, 0.5).toFixed(2)}" height="10" fill="${l.cor}"/>`;
    x += w;
  });
  // Linhas: nome, barra individual, porcentagem, tamanho.
  let linhas = "";
  ling.lista.forEach((l, i) => {
    const y = 100 + i * 28;
    const atraso = (0.3 + i * 0.12).toFixed(2);
    const w = Math.max((l.pct / 100) * 150, 2);
    linhas += `<g class="surge" style="animation-delay:${atraso}s">
  <circle cx="30" cy="${y - 4}" r="5" fill="${l.cor}"/>
  <text x="44" y="${y}" class="sans" font-size="13" fill="${t.texto}">${esc(l.nome)}</text>
  <rect x="170" y="${y - 9}" width="150" height="6" rx="3" fill="${t.trilha}"/>
  <rect x="170" y="${y - 9}" width="${w.toFixed(2)}" height="6" rx="3" fill="${l.cor}" class="cresce" style="animation-delay:${atraso}s"/>
  <text x="372" y="${y}" text-anchor="end" class="mono" font-size="12" fill="${t.texto}">${l.pct.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%</text>
  <text x="416" y="${y}" text-anchor="end" class="mono" font-size="11" fill="${t.mudo}">${tamanho(l.bytes)}</text>
</g>`;
  });
  const conteudo = `
${cabecalhoDeCartao(t, 28, "linguagens", `${ling.quantidade} no total · ${tamanho(ling.total)}`)}
<clipPath id="cantos"><rect x="${xBarra}" y="58" width="${largBarra}" height="10" rx="5"/></clipPath>
<g clip-path="url(#cantos)"><g class="cresce">${empilhada}</g></g>
${linhas}`;
  return moldura(t, L, altura, "Linguagens usadas nos repositórios", conteudo, estilo);
}

function cartaoNumeros(t, user, seq, altura) {
  const L = 440;
  const c = user.contributionsCollection;
  const estrelas = user.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
  const itens = [
    ["repositórios", num(user.repositories.totalCount)],
    ["contribuições em 12 meses", num(c.contributionCalendar.totalContributions)],
    ["commits em 12 meses", num(c.totalCommitContributions)],
    ["pull requests (total)", num(user.pullRequests.totalCount)],
    ["sequência atual", `${num(seq.atual)} ${seq.atual === 1 ? "dia" : "dias"}`],
    ["maior sequência", `${num(seq.maior)} ${seq.maior === 1 ? "dia" : "dias"}`],
    ["estrelas recebidas", num(estrelas)],
  ];
  const estilo = `
  .passo { animation: passo .35s ease-out both; }
  @keyframes passo { from { opacity: 0; } to { opacity: 1; } }`;
  let linhas = "";
  itens.forEach(([rotulo, valor], i) => {
    const y = 72 + i * 28;
    const atraso = (0.4 + i * 0.28).toFixed(2);
    // Pontilhado entre rótulo e valor, como num log de build.
    linhas += `<g class="passo" style="animation-delay:${atraso}s">
  <text x="24" y="${y}" class="mono" font-size="13" fill="${t.passou}">✓</text>
  <text x="44" y="${y}" class="mono" font-size="13" fill="${t.texto}">${esc(rotulo)}</text>
  <line x1="${52 + rotulo.length * 7.9}" y1="${y - 4}" x2="${412 - valor.length * 8.2}" y2="${y - 4}" stroke="${t.borda}" stroke-width="1.5" stroke-dasharray="1.5 4"/>
  <text x="416" y="${y}" text-anchor="end" class="mono" font-size="13" font-weight="700" fill="${t.texto}">${esc(valor)}</text>
</g>`;
  });
  const fim = (0.4 + itens.length * 0.28).toFixed(2);
  const dias = Math.floor((Date.now() - new Date(user.createdAt)) / 86400000);
  const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const conteudo = `
${cabecalhoDeCartao(t, 28, "build", `#${num(dias)} · ${hoje}`)}
${linhas}
<text x="24" y="${altura - 22}" class="mono passo" font-size="12" fill="${t.passou}" style="animation-delay:${fim}s">build passou · ${itens.length}/${itens.length} etapas</text>`;
  return moldura(t, L, altura, "Números do perfil no GitHub", conteudo, estilo);
}

function cartaoAtividade(t, user) {
  const L = 900, A = 190;
  const semanas = user.contributionsCollection.contributionCalendar.weeks;
  const totais = semanas.map((s) => ({
    inicio: s.contributionDays[0].date,
    n: s.contributionDays.reduce((t, d) => t + d.contributionCount, 0),
  }));
  const max = Math.max(1, ...totais.map((s) => s.n));
  const base = 150, altMax = 82, x0 = 28;
  const passo = (L - 56) / totais.length;
  const w = Math.max(passo - 4, 3);
  const estilo = `
  .barra { transform-box: fill-box; transform-origin: bottom; animation: sobe .7s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes sobe { from { transform: scaleY(0); } to { transform: scaleY(1); } }`;
  let barras = "", meses = "", mesAnterior = -1;
  const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  totais.forEach((s, i) => {
    const x = x0 + i * passo;
    const h = s.n === 0 ? 3 : Math.max((s.n / max) * altMax, 6);
    const cor = s.n === 0 ? t.vazio : t.passou;
    const opac = s.n === 0 ? 1 : (0.45 + 0.55 * (s.n / max)).toFixed(2);
    barras += `<rect x="${x.toFixed(2)}" y="${(base - h).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="2" fill="${cor}" fill-opacity="${opac}" class="barra" style="animation-delay:${(i * 0.025).toFixed(3)}s"><title>semana de ${s.inicio}: ${s.n}</title></rect>`;
    const mes = Number(s.inicio.slice(5, 7)) - 1;
    if (mes !== mesAnterior) {
      if (i > 0) meses += `<text x="${x.toFixed(2)}" y="${base + 22}" class="mono" font-size="11" fill="${t.mudo}">${nomes[mes]}</text>`;
      mesAnterior = mes;
    }
  });
  const total = user.contributionsCollection.contributionCalendar.totalContributions;
  const conteudo = `
${cabecalhoDeCartao(t, 28, "histórico", "contribuições por semana · últimos 12 meses")}
<text x="${L - 28}" y="32" text-anchor="end" class="mono" font-size="12" fill="${t.mudo}">pico: ${num(max)}/semana · total: ${num(total)}</text>
<line x1="${x0}" y1="${base + 0.5}" x2="${L - 28}" y2="${base + 0.5}" stroke="${t.borda}"/>
${barras}
${meses}`;
  return moldura(t, L, A, "Contribuições por semana nos últimos 12 meses", conteudo, estilo);
}

function cartaoLinkedin(t) {
  const L = 300, A = 44;
  const estilo = `
  .seta { animation: empurra 1.8s ease-in-out infinite; }
  @keyframes empurra { 50% { transform: translateX(4px); } }`;
  const conteudo = `
<rect x="10" y="10" width="24" height="24" rx="5" fill="#0a66c2"/>
<text x="22" y="28" text-anchor="middle" class="sans" font-size="14" font-weight="700" fill="#fff">in</text>
<text x="44" y="27" class="mono" font-size="13" fill="${t.texto}">conectar no LinkedIn</text>
<text x="${L - 22}" y="27" text-anchor="end" class="mono seta" font-size="14" fill="${t.passou}">→</text>`;
  return moldura(t, L, A, "Conectar no LinkedIn", conteudo, estilo);
}

// ---------- execução ----------

const user = await consultar();
const ling = linguagens(user);
const dias = user.contributionsCollection.contributionCalendar.weeks.flatMap((s) => s.contributionDays);
const seq = sequencias(dias);
// Os dois cartões lado a lado ficam com a mesma altura.
const altura = Math.max(100 + ling.lista.length * 28, 72 + 7 * 28 + 30) + 10;

await mkdir("cartoes", { recursive: true });
for (const [nome, t] of Object.entries(TEMAS)) {
  await writeFile(`cartoes/cabecalho-${nome}.svg`, cartaoCabecalho(t));
  await writeFile(`cartoes/linguagens-${nome}.svg`, cartaoLinguagens(t, ling, altura));
  await writeFile(`cartoes/numeros-${nome}.svg`, cartaoNumeros(t, user, seq, altura));
  await writeFile(`cartoes/atividade-${nome}.svg`, cartaoAtividade(t, user));
  await writeFile(`cartoes/linkedin-${nome}.svg`, cartaoLinkedin(t));
  await writeFile(`cartoes/baleia-${nome}.svg`, cartaoBaleia(t, nome));
  await writeFile(`cartoes/infra-${nome}.svg`, cartaoNoc(t));
}
console.log(`Cartões gerados: ${ling.quantidade} linguagens, ${user.repositories.totalCount} repositórios, sequência ${seq.atual}/${seq.maior}.`);
