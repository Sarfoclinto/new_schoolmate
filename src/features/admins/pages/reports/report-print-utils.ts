/**
 * report-print-utils.ts
 *
 * Two exports:
 *  1. downloadReportPdf(ref, filename)
 *     — patches oklch → rgb before html2canvas runs, then restores.
 *     — captures only the ref element, not the whole page.
 *
 *  2. printReport(ref)
 *     — opens a blank window, copies the ref's innerHTML + all rpt-* styles
 *       + Google Fonts into it, waits for fonts + images, then window.print().
 *     — does NOT rely on react-to-print or contentRef iframe cloning.
 *
 * Why the original approaches broke:
 *  ─ html2canvas crashes on oklch() colors (Tailwind v3/v4 uses them for
 *    borders, backgrounds, etc. in the computed style). Fix: walk every
 *    element in the subtree before capture and replace any oklch() computed
 *    style with its getComputedStyle rgb() equivalent, forcing it inline.
 *
 *  ─ useReactToPrint clones the ref into a sandboxed iframe that has no
 *    stylesheets, so the document is unstyled → blank sheet. Fix: open a
 *    real window (not an iframe), inject exactly the styles we need
 *    (rpt-* CSS + Google Fonts link), copy innerHTML, wait, then print.
 *
 * Usage in ReportDetails.tsx — see bottom of this file.
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// oklch → rgb polyfill for html2canvas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * html2canvas reads *computed* CSS property values off DOM nodes. Modern
 * browsers store colors internally as oklch(). html2canvas's color parser
 * doesn't understand oklch and throws.
 *
 * Strategy: before capturing, walk every element in the subtree. For each
 * CSS property whose *computed* value contains "oklch", convert it to rgb
 * by: (a) setting the value on a throwaway div, (b) reading back the computed
 * value from that div (the browser converts to rgb for us), then (c) applying
 * it as an inline style. After the capture we remove the inline styles we
 * added so the DOM is clean again.
 *
 * The properties we need to patch: the ones html2canvas actually reads.
 * Patching all 300+ properties would be too slow; these are the culprits.
 */
const CANVAS_PROPS = [
  "color",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "boxShadow",
  "textDecorationColor",
  "caretColor",
  "fill",
  "stroke",
] as const;

type PatchedEl = { el: HTMLElement; props: { prop: string; prev: string }[] };

const PROXY_DIV =
  typeof document !== "undefined"
    ? (() => {
        const d = document.createElement("div");
        d.style.position = "absolute";
        d.style.visibility = "hidden";
        d.style.pointerEvents = "none";
        document.body.appendChild(d);
        return d;
      })()
    : null;

/** Convert any color string to rgb()/rgba() using the browser's own parser */
function toRgb(value: string): string {
  if (!PROXY_DIV) return value;
  PROXY_DIV.style.color = "";
  PROXY_DIV.style.color = value;
  const computed = getComputedStyle(PROXY_DIV).color;
  return computed || value;
}

function patchOklch(root: HTMLElement): PatchedEl[] {
  const patched: PatchedEl[] = [];
  const cs = getComputedStyle(root);
  const rootProps: PatchedEl["props"] = [];

  for (const prop of CANVAS_PROPS) {
    const computed = cs[prop as keyof CSSStyleDeclaration] as string;
    if (typeof computed === "string" && computed.includes("oklch")) {
      const rgb = toRgb(computed);
      const prev = root.style[prop as keyof CSSStyleDeclaration] as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (root.style as any)[prop] = rgb;
      rootProps.push({ prop, prev });
    }
  }
  if (rootProps.length) patched.push({ el: root, props: rootProps });

  // Recurse into children
  root.querySelectorAll<HTMLElement>("*").forEach((child) => {
    const childCs = getComputedStyle(child);
    const childProps: PatchedEl["props"] = [];
    for (const prop of CANVAS_PROPS) {
      const computed = childCs[prop as keyof CSSStyleDeclaration] as string;
      if (typeof computed === "string" && computed.includes("oklch")) {
        const rgb = toRgb(computed);
        const prev = child.style[prop as keyof CSSStyleDeclaration] as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (child.style as any)[prop] = rgb;
        childProps.push({ prop, prev });
      }
    }
    if (childProps.length) patched.push({ el: child, props: childProps });
  });

  return patched;
}

function restoreOklch(patched: PatchedEl[]) {
  for (const { el, props } of patched) {
    for (const { prop, prev } of props) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el.style as any)[prop] = prev;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF download
// ─────────────────────────────────────────────────────────────────────────────

export async function downloadReportPdf(
  ref: React.RefObject<HTMLDivElement | null>,
  filename = "Student_Terminal_Report.pdf",
): Promise<void> {
  const node = ref.current;
  if (!node) return;

  // 1. Patch oklch → rgb inline before capture
  const patched = patchOklch(node);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      // Tell html2canvas to use the inline styles we just applied
      // (it already does, but this makes the intent explicit)
      onclone: (clonedDoc) => {
        // Remove any Tailwind CDN / vite-injected <style> that could
        // re-introduce oklch in the cloned document. We only need the
        // rpt-* styles for the report.
        const styles = clonedDoc.querySelectorAll<HTMLStyleElement>("style");
        styles.forEach((s) => {
          // Keep only styles that contain rpt- rules
          if (!s.textContent?.includes("rpt-")) s.remove();
        });
        // Remove external stylesheets (Tailwind built CSS) from clone
        const links = clonedDoc.querySelectorAll<HTMLLinkElement>(
          "link[rel='stylesheet']",
        );
        links.forEach((l) => l.remove());
      },
    });
  } finally {
    // 2. Always restore — even if capture threw
    restoreOklch(patched);
  }

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  // Multi-page support
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
// Print via new window (not iframe — iframe has no stylesheets)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collect every <style> tag whose content contains "rpt-" (our report styles)
 * so we can inject them into the print window.
 */
function collectRptStyles(): string {
  if (typeof document === "undefined") return "";
  const styles: string[] = [];
  document.querySelectorAll<HTMLStyleElement>("style").forEach((s) => {
    if (s.textContent?.includes("rpt-")) {
      styles.push(s.textContent);
    }
  });
  return styles.join("\n");
}

export function printReport(ref: React.RefObject<HTMLDivElement | null>): void {
  const node = ref.current;
  if (!node) return;

  const rptCss = collectRptStyles();
  const innerHTML = node.innerHTML;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this page to print.");
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student Terminal Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12px; }
    @page { size: A4 portrait; margin: 10mm 12mm; }
    @media print {
      html, body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    /* ── Paste rpt-* rules ── */
    ${rptCss}
  </style>
</head>
<body>
  <div id="report-print-root" class="rpt-root" style="width:100%;padding:0">
    ${innerHTML}
  </div>
</body>
</html>`);

  win.document.close();

  // Wait for fonts, then images, then print
  const waitFonts = () =>
    win.document.fonts ? win.document.fonts.ready : Promise.resolve();

  const waitImages = () =>
    new Promise<void>((resolve) => {
      const imgs = Array.from(win.document.images);
      if (!imgs.length) {
        resolve();
        return;
      }
      let n = 0;
      const done = () => {
        if (++n === imgs.length) resolve();
      };
      imgs.forEach((img) => {
        if (img.complete) {
          done();
        } else {
          img.onload = done;
          img.onerror = done;
        }
      });
    });

  // 500 ms initial settle for CSS / fonts
  setTimeout(async () => {
    try {
      await waitFonts();
      await waitImages();
    } catch (err) {
        console.info("err: ",err)
      // proceed anyway
    }
    // Extra 200 ms for layout reflow
    setTimeout(() => {
      win.focus();
      win.print();
    }, 200);
  }, 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO UPDATE ReportDetails.tsx
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Remove all existing print/PDF imports:
//    ✗  import html2canvas from "html2canvas";
//    ✗  import jsPDF from "jspdf";
//    ✗  import { useReactToPrint } from "react-to-print";
//
// 2. Add:
//    import { downloadReportPdf, printReport } from "./report-print-utils";
//
// 3. Replace the reportRef declaration (keep it exactly as-is):
//    const reportRef = useRef<HTMLDivElement>(null);
//
// 4. Remove the `handlePrint = useReactToPrint(…)` block entirely.
//
// 5. Update the two button onClick handlers:
//
//    // Print button
//    onClick={() => printReport(reportRef)}
//
//    // Download PDF button
//    onClick={() => {
//      const name = data?.studentDetails
//        ? `${data.studentDetails.firstName}_${data.studentDetails.surname}_Report.pdf`
//        : "Student_Terminal_Report.pdf";
//      downloadReportPdf(reportRef, name);
//    }}
//
// 6. Make sure the ref is on the innermost div (the ReportDocument wrapper),
//    NOT on the outer scrollable container. In ReportDetails.tsx that's:
//
//    <div ref={reportRef} style={{ minWidth: 640, background: "#fff" }}>
//      <ReportDocument … />
//    </div>
//
//    This is already correct in the existing code — no change needed.
//
// That's all. No other changes to ReportDetails.tsx or util-component.tsx.
