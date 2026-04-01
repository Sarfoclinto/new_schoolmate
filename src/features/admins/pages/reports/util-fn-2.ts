/**
 * report-print-utils.ts  —  v4 (final)
 *
 * Now that ReportDocument uses 100% inline styles, html2canvas never
 * reads Tailwind class-driven computed styles → no oklch → no crash.
 *
 * Two exports:
 *
 *  downloadReportPdf(ref, filename)
 *    Captures the ref element with html2canvas and saves as PDF.
 *    The QRCode (AntD) renders as a <canvas> — html2canvas handles
 *    canvas elements natively via cloneNode, so it works fine.
 *
 *  printReport(ref)
 *    Serialises the ref's innerHTML into a new window with just enough
 *    CSS to render the inline-styled content correctly, then prints.
 *    The rpt-* class names are no longer relied upon — everything is
 *    already inline — but we still inject the PRINT_STYLES for @page
 *    margins.
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// oklch → rgb converter  (uses the browser's own cascade to do the math)
// ─────────────────────────────────────────────────────────────────────────────

let _convEl: HTMLElement | null = null;

function getConverterEl(): HTMLElement {
  if (_convEl) return _convEl;
  _convEl = document.createElement("div");
  _convEl.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:0;height:0;" +
    "visibility:hidden;pointer-events:none;";
  document.body.appendChild(_convEl);
  return _convEl;
}

function oklchToRgb(raw: string): string {
  if (!raw || !raw.includes("oklch")) return raw;
  const el = getConverterEl();
  try {
    el.style.color = "";
    el.style.color = raw;
    const converted = getComputedStyle(el).color;
    return converted || raw;
  } catch {
    return raw;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// The exact property names html2canvas reads from CSSStyleDeclaration
// (from CSSParsedDeclaration constructor in html2canvas/dist/html2canvas.js)
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_PROPS = [
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "color",
  "textDecorationColor",
  "webkitTextStrokeColor",
  "outlineColor",
  "caretColor",
] as const;

type SavedDescriptor = {
  prop: string;
  descriptor: PropertyDescriptor | undefined;
};

function patchCSSDeclarationProto(): SavedDescriptor[] {
  const proto = CSSStyleDeclaration.prototype;
  const saved: SavedDescriptor[] = [];

  for (const prop of COLOR_PROPS) {
    const original = Object.getOwnPropertyDescriptor(proto, prop);
    saved.push({ prop, descriptor: original });

    Object.defineProperty(proto, prop, {
      configurable: true,
      enumerable: true,
      get(this: CSSStyleDeclaration): string {
        const raw: string = original?.get
          ? original.get.call(this)
          : this.getPropertyValue(
              prop.replace(/([A-Z])/g, "-$1").toLowerCase(),
            );
        return oklchToRgb(raw);
      },
    });
  }

  const origGpv = Object.getOwnPropertyDescriptor(proto, "getPropertyValue");
  saved.push({ prop: "getPropertyValue", descriptor: origGpv });

  Object.defineProperty(proto, "getPropertyValue", {
    configurable: true,
    enumerable: false,
    writable: true,
    value(this: CSSStyleDeclaration, property: string): string {
      const raw: string = origGpv?.value
        ? origGpv.value.call(this, property)
        : "";
      return oklchToRgb(raw);
    },
  });

  return saved;
}

function restoreCSSDeclarationProto(saved: SavedDescriptor[]) {
  const proto = CSSStyleDeclaration.prototype;
  for (const { prop, descriptor } of saved) {
    if (descriptor) {
      Object.defineProperty(proto, prop, descriptor);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (proto as any)[prop];
      } catch {
        /* some envs disallow delete on native protos */
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────────────────────────────

export async function downloadReportPdf(
  ref: React.RefObject<HTMLDivElement | null>,
  filename: string = "Student_Terminal_Report.pdf",
): Promise<void> {
  const node = ref.current;
  if (!node) {
    console.warn(
      "[downloadReportPdf] ref.current is null — is the report mounted?",
    );
    return;
  }

  const saved = patchCSSDeclarationProto();
  let canvas: HTMLCanvasElement;

  try {
    canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (_doc, clonedEl) => {
        clonedEl.style.background = "#ffffff";
      },
    });
  } finally {
    restoreCSSDeclarationProto(saved);
  }

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let yOffset = 0;
  let page = 0;
  while (yOffset < imgH) {
    if (page > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -yOffset, imgW, imgH);
    yOffset += pageH;
    page++;
  }

  pdf.save(filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// Print
// ─────────────────────────────────────────────────────────────────────────────

// function collectRptStyles(): string {
//   if (typeof document === "undefined") return "";
//   const chunks: string[] = [];

//   document.querySelectorAll<HTMLStyleElement>("style").forEach((s) => {
//     const text = s.textContent ?? "";
//     if (text.includes("rpt-")) chunks.push(text);
//   });

//   const byId = document.getElementById(
//     "rpt-print-styles",
//   ) as HTMLStyleElement | null;
//   if (byId?.textContent && !chunks.some((c) => c === byId.textContent)) {
//     chunks.push(byId.textContent);
//   }

//   if (chunks.length === 0) {
//     chunks.push(`
//       .rpt-root { font-family: 'Times New Roman', serif; font-size: 12px; color: #000; }
//       .rpt-table { width: 100%; border-collapse: collapse; }
//       .rpt-th, .rpt-td { border: 1px solid #000; padding: 3px 5px; text-align: center; font-size: 11px; }
//       .rpt-th-left, .rpt-td-left { text-align: left; }
//       .rpt-label { font-weight: 700; font-size: 11px; }
//       .rpt-value { font-size: 11px; }
//       .rpt-border { border: 1px solid #000; }
//       .rpt-cell { padding: 3px 6px; }
//       .rpt-br { border-right: 1px solid #000; }
//       .rpt-bb { border-bottom: 1px solid #000; }
//       .rpt-grid { display: grid; }
//       .rpt-g3 { grid-template-columns: repeat(3, 1fr); }
//       .rpt-g51 { grid-template-columns: 5fr 1fr; }
//       .rpt-section-bar { background: #0D1B2E; color: #fff; padding: 2px 6px; font-size: 11px; font-weight: 700; }
//     `);
//   }

//   return chunks.join("\n");
// }

export function printReport(ref: React.RefObject<HTMLDivElement | null>): void {
  const node = ref.current;
  if (!node) {
    console.warn("[printReport] ref.current is null — is the report mounted?");
    return;
  }

  // const rptCss = collectRptStyles();
  const innerHTML = node.innerHTML;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Pop-up was blocked. Allow pop-ups for this site and try again.");
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Student Terminal Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #fff;
      font-family: 'Times New Roman', Times, serif;
      font-size: 12px;
      color: #000;
    }
    @page { size: A4 portrait; margin: 10mm 12mm; }
    @media print {
      html, body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
    
  </style>
</head>
<body>
  <div id="report-print-root" class="rpt-root" style="width:100%;padding:0;background:#fff;color:#000">
    ${innerHTML}
  </div>
</body>
</html>`);
  win.document.close();

  const waitFonts = (): Promise<void> =>
    win.document.fonts
      ? win.document.fonts.ready.then(() => undefined)
      : Promise.resolve();

  const waitImages = (): Promise<void> =>
    new Promise((resolve) => {
      const imgs = Array.from(win.document.images);
      if (!imgs.length) {
        resolve();
        return;
      }
      let n = 0;
      const done = () => {
        if (++n >= imgs.length) resolve();
      };
      imgs.forEach((img) =>
        img.complete
          ? done()
          : Object.assign(img, { onload: done, onerror: done }),
      );
    });

  setTimeout(async () => {
    try {
      await waitFonts();
      await waitImages();
    } catch {
      /* proceed */
    }
    setTimeout(() => {
      win.focus();
      win.print();
    }, 250);
  }, 600);
}
