#!/usr/bin/env python3
"""Gera os currículos em PDF (PT-BR e EN) a partir das MESMAS fontes do site.

Fontes de dados (nada é digitado de novo aqui):
  - src/data/profile.json              contato
  - src/i18n/locales/{pt-BR,en}.json   todos os textos
  - src/data/*.ts                      projetos, tecnologias, experiência (via Node)

Uso:  python scripts/build_resume.py        (requer: pip install reportlab; Node 22+)
Saída: public/resume/gustavo-morais-{pt-BR,en}.pdf
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "resume"
LOCALES = ("pt-BR", "en")
ACCENT = colors.HexColor("#C45A00")  # laranja escurecido: contraste adequado em papel
INK = colors.HexColor("#1A1D23")
MUTED = colors.HexColor("#555C68")

FONT_CANDIDATES = [  # (regular, bold) — primeira dupla que existir E tiver a seta "→"
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ("C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/segoeuib.ttf"),
    ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
    ("/Library/Fonts/Arial.ttf", "/Library/Fonts/Arial Bold.ttf"),
    ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
]


def register_fonts() -> tuple[str, str, bool]:
    """Devolve (regular, bold, suporta_seta). Sem TTF utilizável, cai na Helvetica e troca '→' por '->'."""
    for regular, bold in FONT_CANDIDATES:
        if Path(regular).exists() and Path(bold).exists():
            try:
                font = TTFont("Body", regular)
                if 0x2192 in font.face.charToGlyph:
                    pdfmetrics.registerFont(font)
                    pdfmetrics.registerFont(TTFont("Body-Bold", bold))
                    # Sem isso, <b> no Paragraph não troca de fonte.
                    pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-Bold", italic="Body", boldItalic="Body-Bold")
                    return "Body", "Body-Bold", True
            except Exception:  # fonte corrompida: tenta a próxima
                continue
    return "Helvetica", "Helvetica-Bold", False


def load_data() -> dict:
    node = subprocess.run(
        ["node", "--experimental-strip-types", str(ROOT / "scripts" / "export_data.mjs")],
        capture_output=True, text=True, check=True, cwd=ROOT,
    )
    data = json.loads(node.stdout)
    data["profile"] = json.loads((ROOT / "src/data/profile.json").read_text(encoding="utf-8"))
    data["locales"] = {
        loc: json.loads((ROOT / f"src/i18n/locales/{loc}.json").read_text(encoding="utf-8")) for loc in LOCALES
    }
    return data


def build(locale: str, data: dict, fonts: tuple[str, str, bool]) -> Path:
    regular, bold, has_arrow = fonts
    L, profile = data["locales"][locale], data["profile"]
    clean = (lambda s: s) if has_arrow else (lambda s: s.replace("→", "->"))
    p = lambda s: escape(clean(s))  # noqa: E731

    base = ParagraphStyle("base", fontName=regular, fontSize=9.4, leading=13.2, textColor=INK, alignment=TA_LEFT)
    small = ParagraphStyle("small", parent=base, fontSize=8.4, leading=11.5, textColor=MUTED)
    h1 = ParagraphStyle("h1", parent=base, fontName=bold, fontSize=21, leading=25)
    role = ParagraphStyle("role", parent=base, fontSize=11, leading=14, textColor=ACCENT)
    h2 = ParagraphStyle("h2", parent=base, fontName=bold, fontSize=9.6, leading=12, textColor=ACCENT, spaceBefore=11, spaceAfter=3)
    h3 = ParagraphStyle("h3", parent=base, fontName=bold, fontSize=10.2, leading=13)
    bullet = ParagraphStyle("bullet", parent=base, leftIndent=11, bulletIndent=1, spaceAfter=1.4)

    def section(title: str) -> list:
        return [Paragraph(p(title.upper()), h2), HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#D5D8DE"), spaceAfter=4)]

    def bul(text: str) -> Paragraph:
        return Paragraph(p(text), bullet, bulletText="•")

    flow = next(x for x in data["projects"] if x["id"] == "flow")
    story: list = [
        Paragraph(p(profile["name"]), h1),
        Paragraph(p(L["header"]["role"]), role),
        Spacer(1, 3),
        Paragraph(
            f'{p(profile["email"])} &nbsp;·&nbsp; {p(profile["linkedin"].removeprefix("https://www."))} &nbsp;·&nbsp; {p(profile["github"].removeprefix("https://"))}',
            small,
        ),
        *section(L["about"]["title"]),
        Paragraph(p(L["about"]["p1"]), base),
        Spacer(1, 2),
        Paragraph(p(L["about"]["p3"]), base),
    ]

    # Experiência
    story += section(L["experience"]["title"])
    for job in data["experience"]:
        block = [
            Paragraph(p(f'{job["organization"]} — {L["experience"]["current"]["role"]}'), h3),
            Paragraph(p(f'{L["experience"]["current"]["area"]} · {L["experience"]["current"]["period"]}'), small),
            Spacer(1, 3),
            Paragraph(p(L["projects"]["flow"]["summary"]), base),
            Spacer(1, 3),
        ]
        for m in flow["modules"]:
            mod = L["projects"]["flow"]["modules"][m["id"]]
            line = f'<b>{p(m["name"])}</b>: {p(mod["application"])} <font color="#C45A00">{p(mod["result"].replace(" ", "\u00a0"))}</font>'
            block.append(Paragraph(clean(line), bullet, bulletText="•"))
            for key in ("note1", "note2"):
                if key in mod:
                    block.append(Paragraph(p(mod[key]), ParagraphStyle("n", parent=bullet, leftIndent=22, textColor=MUTED, fontSize=8.6, leading=11.5)))
        block += [Spacer(1, 2), Paragraph(p(L["projects"]["flow"]["resultsNote"]), small), Paragraph(p(L["projects"]["flow"]["notice"]), small)]
        story.append(KeepTogether(block[:6]))
        story += block[6:]

    # Formação
    story += section(L["experience"]["education"])
    for e in data["education"]:
        note = f' ({L["experience"]["cruzeiroNote"]})' if e["textKey"] == "cruzeiro" else ""
        story.append(Paragraph(p(f'<b>{L["experience"][e["textKey"]]}</b> — {e["institution"]}{note}').replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>"), base))

    # Tecnologias (sem barras de proficiência)
    story += section(L["tech"]["title"])
    for cat in data["techCategoryOrder"]:
        names = ", ".join(t["name"] for t in data["technologies"] if t["category"] == cat)
        story.append(Paragraph(f'<b>{p(L["tech"]["categories"][cat])}:</b> {p(names)}', base))
    used = ", ".join(t["name"] for t in data["technologies"] if t.get("usedIn"))
    story += [Spacer(1, 2), Paragraph(p(f'{L["tech"]["professionalBadge"]} (FLOW): {used}'), small)]

    # Projetos (classificação honesta de autoria)
    story += section(L["projects"]["title"])
    for proj in data["projects"]:
        text = L["projects"][proj["textKey"]]
        kind = L["projects"]["kinds"][proj["kind"]]
        block = [
            Paragraph(f'<b>{p(proj["name"])}</b> — {p(kind)}', base),
            Paragraph(p(text["summary"]), small),
        ]
        if proj["kind"] == "fork":
            block.append(Paragraph(p(text["credit"]), small))
        block += [Paragraph(p(proj["repository"].removeprefix("https://")), small), Spacer(1, 3)]
        story.append(KeepTogether(block))  # título e texto nunca ficam em páginas diferentes

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"gustavo-morais-{locale}.pdf"
    doc = SimpleDocTemplate(
        str(path), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=15 * mm,
        title=f'{profile["name"]} — {L["experience"]["resume"]}', author=profile["name"], lang=locale,
    )
    doc.build(story)
    return path


def main() -> int:
    data = load_data()
    fonts = register_fonts()
    if not fonts[2]:
        print("aviso: nenhuma fonte TTF com a seta '→' encontrada; usando Helvetica e '->'", file=sys.stderr)
    for locale in LOCALES:
        print("gerado:", build(locale, data, fonts).relative_to(ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
