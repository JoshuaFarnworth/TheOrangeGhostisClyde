from PIL import Image, ImageChops, ImageStat
a=Image.open('/tmp/v_hi.png').convert('L'); b=Image.open('/tmp/v_lo.png').convert('L')
a=a.resize((200,int(200*a.height/a.width)),Image.LANCZOS); b=b.resize(a.size,Image.LANCZOS)
print('res-diff mean abs (0-255):', round(ImageStat.Stat(ImageChops.difference(a,b)).mean[0],2))
