import sys,glob
from PIL import Image
d,out=sys.argv[1],sys.argv[2]
fs=sorted(glob.glob(d+'/*.png'));ims=[Image.open(f).convert('RGB') for f in fs]
w=300;h=int(ims[0].height*w/ims[0].width);cols=4;rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h),'white')
for i,im in enumerate(ims):S.paste(im.resize((w,h),Image.LANCZOS),((i%cols)*w,(i//cols)*h))
S.save(out)
