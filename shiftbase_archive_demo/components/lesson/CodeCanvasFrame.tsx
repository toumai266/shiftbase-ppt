"use client";

type CodeCanvasFrameProps = {
  className?: string;
  source: string;
  title: string;
};

export function buildCodeCanvasDocument(source: string) {
  const trimmed = source.trim();
  if (!trimmed) return injectCanvasSecurity(emptyCanvasDocument);
  if (/<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) return injectCanvasSecurity(trimmed);

  return injectCanvasSecurity(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; min-height: 100%; margin: 0; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; background: #ffffff; }
  </style>
</head>
<body>
${trimmed}
</body>
</html>`);
}

export function CodeCanvasFrame({ className = "", source, title }: CodeCanvasFrameProps) {
  return (
    <iframe
      className={`h-full min-h-[420px] w-full border-0 bg-white ${className}`}
      referrerPolicy="no-referrer"
      sandbox="allow-pointer-lock allow-scripts allow-same-origin"
      srcDoc={buildCodeCanvasDocument(source)}
      title={title}
    />
  );
}

const canvasSecurityMeta =
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' 'self'; img-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:*; font-src data:; media-src data: blob: https: http://localhost:* http://127.0.0.1:*; connect-src 'none'; form-action 'none'; base-uri 'none';">`;

function injectCanvasSecurity(document: string) {
  if (/http-equiv=["']Content-Security-Policy["']/i.test(document)) return document;
  if (/<head[\s>]/i.test(document)) return document.replace(/<head([\s>])/i, `<head$1\n  ${canvasSecurityMeta}`);
  return document.replace(/<html([\s>])/i, `<html$1\n<head>${canvasSecurityMeta}</head>`);
}

const emptyCanvasDocument = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { height: 100%; margin: 0; }
    body { display: grid; place-items: center; font-family: ui-sans-serif, system-ui, sans-serif; color: #6b7280; background: #ffffff; }
  </style>
</head>
<body></body>
</html>`;
