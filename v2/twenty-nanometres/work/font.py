from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
import json,sys
def ext(path, chars):
    f=TTFont(path); gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm
    out={}
    for ch in chars:
        g=cmap.get(ord(ch));
        if not g: continue
        p=RecordingPen(); gs[g].draw(p); s=[]
        for op,args in p.value:
            if op=='moveTo': s.append('M'+' '.join('%d %d'%(round(x),round(y)) for x,y in args))
            elif op=='lineTo': s.append('L'+' '.join('%d %d'%(round(x),round(y)) for x,y in args))
            elif op=='qCurveTo':
                # expand implied on-curve points
                pts=list(args); 
                if pts[-1] is None: pts=pts[:-1]
                ctrl=pts[:-1]; end=pts[-1]
                for i,c in enumerate(ctrl):
                    if i<len(ctrl)-1:
                        n=ctrl[i+1]; e=((c[0]+n[0])/2,(c[1]+n[1])/2)
                    else: e=end
                    s.append('Q%d %d %d %d'%(round(c[0]),round(c[1]),round(e[0]),round(e[1])))
            elif op=='curveTo':
                s.append('C'+' '.join('%d %d'%(round(x),round(y)) for x,y in args))
            elif op in('closePath','endPath'): s.append('Z')
        out[ch]=[gs[g].width,''.join(s)]
    return {'upm':upm,'g':out}
D='/usr/share/fonts/truetype/sand-box/google/Old Standard TT/'
import re
lex=open('src/lexicon.js').read(); used=''.join(sorted(set(''.join(re.findall(r"\['([A-Z ]+)'",lex)))))
import os
BP=os.environ.get('BFONT', D+'OldStandardTT-Bold.ttf')
B=ext(BP,used)
I=ext(D+'OldStandardTT-Italic.ttf','Figabcde0123456789 .')
R=ext(D+'OldStandardTT-Regular.ttf','AB ')
js='var FONT='+json.dumps({'B':B,'I':I,'R':R},separators=(',',':'))+';'
open(sys.argv[1],'w').write(js); print(len(js))
