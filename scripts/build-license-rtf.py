#!/usr/bin/env python3
"""Builds LICENSE.rtf (shown in the DMG's license window) from LICENSE.txt.

LICENSE.txt is the source of truth; edit it, then run:  python3 scripts/build-license-rtf.py
Paragraphs are separated by blank lines and re-flowed (no hard line breaks), the title and
numbered section headings are bold, clause labels like "2.1 Subscription Plans." are bold,
and divider lines (────) are dropped in favor of spacing.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'LICENSE.txt')
OUT = os.path.join(ROOT, 'LICENSE.rtf')


def rtf_escape(text):
    out = []
    for ch in text:
        if ch in '\\{}':
            out.append('\\' + ch)
        elif ord(ch) > 127:
            code = ord(ch)
            out.append('\\u%d?' % (code if code < 32768 else code - 65536))
        else:
            out.append(ch)
    return ''.join(out)


def paragraphs(text):
    for block in re.split(r'\n\s*\n', text.strip()):
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines or all(re.fullmatch(r'[─—\-_=\s]+', l) for l in lines):
            continue
        yield ' '.join(lines)


HEADING = re.compile(r'^\d+\.\s+[A-Z][A-Z ,&/\-]+$')
CLAUSE = re.compile(r'^(\d+\.\d+\s+[^.]{1,60}\.)\s+(.*)$')

body = []
for i, para in enumerate(paragraphs(open(SRC, encoding='utf-8').read())):
    if i == 0:
        # Title
        body.append(r'\pard\sa120\qc\f1\fs30 ' + rtf_escape(para) + r'\f0\fs24\par')
    elif HEADING.match(para):
        body.append(r'\pard\sb280\sa100\f1\fs24 ' + rtf_escape(para) + r'\f0\par')
    elif CLAUSE.match(para):
        label, rest = CLAUSE.match(para).groups()
        body.append(r'\pard\sa140\f1 ' + rtf_escape(label) + r'\f0  ' + rtf_escape(rest) + r'\par')
    elif para.startswith('Last Updated'):
        body.append(r'\pard\sa260\qc\cf2\fs20 ' + rtf_escape(para) + r'\cf0\fs24\par')
    else:
        body.append(r'\pard\sa140 ' + rtf_escape(para) + r'\par')

rtf = (r'{\rtf1\ansi\ansicpg1252\deff0'
       r'{\fonttbl{\f0\fswiss\fcharset0 Helvetica;}{\f1\fswiss\fcharset0 Helvetica-Bold;}}'
       r'{\colortbl;\red0\green0\blue0;\red110\green110\blue115;}'
       r'\margl720\margr720\f0\fs24\sl276\slmult1' '\n'
       + '\n'.join(body) + '\n}\n')
open(OUT, 'w', encoding='ascii').write(rtf)
print('wrote', OUT)
