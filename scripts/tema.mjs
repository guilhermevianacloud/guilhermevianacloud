// Visual compartilhado pelos cartões do perfil e do jogo.

export const TEMAS = {
  escuro: {
    fundo: "#0b1020", borda: "#1e2943", trilha: "#18213a", texto: "#e6edf3",
    mudo: "#8592b0", passou: "#3ddc97", destaque: "#7aa2ff", vazio: "#1c2640",
  },
  claro: {
    fundo: "#ffffff", borda: "#d9dfea", trilha: "#eef1f7", texto: "#1b2333",
    mudo: "#5b6782", passou: "#12a36b", destaque: "#3d63dd", vazio: "#e6eaf2",
  },
};

export const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
export const MONO = "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace";

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Quem pediu menos movimento no sistema vê o estado final, sem animação.
const SEM_MOVIMENTO = "@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }";

export function moldura(t, largura, altura, titulo, conteudo, estilo = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="${esc(titulo)}">
<title>${esc(titulo)}</title>
<style>
  .sans { font-family: ${SANS}; }
  .mono { font-family: ${MONO}; }
  ${estilo}
  ${SEM_MOVIMENTO}
</style>
<clipPath id="dentro"><rect x="1" y="1" width="${largura - 2}" height="${altura - 2}" rx="13"/></clipPath>
<rect x="0.5" y="0.5" width="${largura - 1}" height="${altura - 1}" rx="14" fill="${t.fundo}" stroke="${t.borda}"/>
<g clip-path="url(#dentro)">${conteudo}</g>
</svg>
`;
}

export function cabecalhoDeCartao(t, x, rotulo, detalhe) {
  return `<circle cx="${x}" cy="28" r="4" fill="${t.passou}"/>
<text x="${x + 12}" y="32" class="mono" font-size="13" fill="${t.texto}" font-weight="600">${esc(rotulo)}</text>
<text x="${x + 12 + rotulo.length * 8 + 10}" y="32" class="mono" font-size="12" fill="${t.mudo}">${esc(detalhe)}</text>`;
}

