// When/Notes text is stored as HTML that may contain only <b>, <i> and <u>.
// safeRich() is applied on save (cue list) and again when printing (PDFs), so anything
// else (other tags, stray < or &, imported files) can't break the layout.

const ALLOWED = { b: 'b', strong: 'b', i: 'i', em: 'i', u: 'u' };

function safeRich(html) {
  if (!html) return '';
  const kept = [];
  let s = String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(div|p)>/gi, ' ')
    // Park allowed tags as placeholders so the escaping below leaves them alone
    .replace(/<(\/?)(b|strong|i|em|u)(\s[^>]*)?>/gi, (m, close, tag) => {
      kept.push(`<${close}${ALLOWED[tag.toLowerCase()]}>`);
      return `\u0000${kept.length - 1}\u0000`;
    })
    .replace(/<[^>]*>/g, '')
    .replace(/&(?!(amp|lt|gt|quot|#39|nbsp);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\u0000(\d+)\u0000/g, (m, n) => kept[n]);
  const plain = s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return plain ? s.replace(/\s+/g, ' ').trim() : '';
}

// Plain text (with & < > escaped) for a value that should never carry formatting, like an LQ number
function escapeText(text) {
  return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = { safeRich, escapeText };
