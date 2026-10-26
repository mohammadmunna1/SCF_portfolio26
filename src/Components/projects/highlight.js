// A deliberately tiny syntax highlighter for the short repository excerpts shown on SQA project cards.
// Tones map to theme colours in CodeWindow (keyword → accent, string → heading, comment/tag → muted).

const GHERKIN_KEYWORD =
  /^(\s*)(Feature:|Rule:|Background:|Scenario Outline:|Scenario Template:|Scenario:|Example:|Examples:|Given|When|Then|And|But|\*)(?=\s|$)/;

const KEYWORDS = {
  javascript:
    "const|let|var|function|return|if|else|for|of|in|new|async|await|import|from|export|default|class|extends|this|try|catch|throw|describe|context|it|before|beforeEach|after|afterEach|cy|expect",
  java: "public|private|protected|class|interface|void|static|final|new|return|if|else|for|while|import|package|extends|implements|this|throws|try|catch",
  python: "def|class|return|if|elif|else|for|while|in|import|from|as|with|self|None|True|False|try|except|raise",
};
KEYWORDS.typescript = `${KEYWORDS.javascript}|interface|type|enum|implements|readonly`;

const COMMENT = { javascript: "\\/\\/.*$", typescript: "\\/\\/.*$", java: "\\/\\/.*$", python: "#.*$" };
const STRINGS = "`(?:\\\\.|[^`\\\\])*`|'(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\"";

const tokenizers = {};
function tokenizerFor(language) {
  if (!tokenizers[language]) {
    tokenizers[language] = new RegExp(`(${COMMENT[language]})|(${STRINGS})|\\b(${KEYWORDS[language]})\\b|(=>|@\\w+)`, "g");
  }
  return tokenizers[language];
}

function highlightCode(line, language) {
  const parts = [];
  let last = 0;
  for (const match of line.matchAll(tokenizerFor(language))) {
    if (match.index > last) parts.push({ text: line.slice(last, match.index) });
    const tone = match[1] ? "comment" : match[2] ? "string" : "keyword";
    parts.push({ text: match[0], tone });
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last) });
  return parts;
}

const splitStrings = (text) =>
  text
    .split(/("[^"]*"|<[^>\s]+>)/)
    .filter(Boolean)
    .map((part) => (/^["<]/.test(part) ? { text: part, tone: "string" } : { text: part }));

function highlightGherkin(line) {
  if (/^\s*#/.test(line)) return [{ text: line, tone: "comment" }];
  if (/^\s*@/.test(line)) return [{ text: line, tone: "tag" }];
  const match = line.match(GHERKIN_KEYWORD);
  if (!match) return splitStrings(line);
  return [{ text: match[1] }, { text: match[2], tone: "keyword" }, ...splitStrings(line.slice(match[0].length))];
}

/** Splits code into lines of { text, tone } parts. Unknown languages are returned as plain text. */
export function highlight(code = "", language = "") {
  return String(code)
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => {
      if (language === "gherkin") return highlightGherkin(line);
      if (KEYWORDS[language]) return highlightCode(line, language);
      return [{ text: line }];
    });
}

/** Best guess when no language was chosen, from the file name. */
export function languageFor(project) {
  if (project.snippetLanguage) return project.snippetLanguage;
  const extension = String(project.snippetFile || "").split(".").pop().toLowerCase();
  return { feature: "gherkin", js: "javascript", cjs: "javascript", mjs: "javascript", ts: "typescript", java: "java", py: "python" }[extension] || "text";
}
