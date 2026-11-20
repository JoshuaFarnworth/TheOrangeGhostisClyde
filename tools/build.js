// node build.js <slug>  -> dist/aleatory/<slug>.html, dist/fxhash/{index.html,index.js,fxhash.min.js}, zips
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const slug = process.argv[2];
const S = path.join(__dirname, '..', 'series'), dir = path.join(S, slug);
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'src', 'meta.json'), 'utf8'));
const shared = fs.readFileSync(path.join(S, '_shared', 'clyde.js'), 'utf8');
const art = fs.readFileSync(path.join(dir, 'src', 'art.js'), 'utf8');
const dist = path.join(dir, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'aleatory'), { recursive: true });
fs.mkdirSync(path.join(dist, 'fxhash'), { recursive: true });
const style = `<style>html,body{margin:0;height:100%;background:${meta.bg || '#111'}}canvas{display:block}</style>`;
// Aleatory: one self-contained HTML, runtime kind "vanilla" (Canvas 2D), no network, ready() at the end.
const alea = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${meta.title} by Clyde</title>
${style}
</head>
<body>
<script>
${shared}
</script>
<script>
${art}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(dist, 'aleatory', slug + '.html'), alea);
// fxhash: index.html + local ./fxhash.min.js (@fxhash/project-sdk) + index.js
fs.copyFileSync(path.join(S, '_shared', 'fxhash.min.js'), path.join(dist, 'fxhash', 'fxhash.min.js'));
fs.writeFileSync(path.join(dist, 'fxhash', 'index.js'), shared + '\n' + art);
fs.writeFileSync(path.join(dist, 'fxhash', 'index.html'), `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${meta.title} by Clyde</title>
<script src="./fxhash.min.js"></script>
${style}
</head>
<body>
<script src="./index.js"></script>
</body>
</html>
`);
execSync(`cd "${path.join(dist, "fxhash")}" && python3 -c "import zipfile;z=zipfile.ZipFile('../${slug}-fxhash.zip','w',zipfile.ZIP_DEFLATED);[z.write(f) for f in ('index.html','index.js','fxhash.min.js')]"`);
execSync(`cd "${path.join(dist, "aleatory")}" && python3 -c "import zipfile;z=zipfile.ZipFile('../${slug}-aleatory.zip','w',zipfile.ZIP_DEFLATED);z.write('${slug}.html')"`);
// Highlight: index.html + hl-gen.js + index.js (zip the files, not the folder)
fs.mkdirSync(path.join(dist, 'highlight'), { recursive: true });
fs.copyFileSync(path.join(S, '_shared', 'hl-gen.js'), path.join(dist, 'highlight', 'hl-gen.js'));
fs.writeFileSync(path.join(dist, 'highlight', 'index.js'), shared + '\n' + art);
fs.writeFileSync(path.join(dist, 'highlight', 'index.html'), `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${meta.title} by Clyde</title>
<script src="hl-gen.js"></script>
${style}
</head>
<body>
<script src="index.js"></script>
</body>
</html>
`);
execSync(`cd "${path.join(dist, "highlight")}" && python3 -c "import zipfile;z=zipfile.ZipFile('../${slug}-highlight.zip','w',zipfile.ZIP_DEFLATED);[z.write(f) for f in ('index.html','index.js','hl-gen.js')]"`);
// Verse: the same self-contained HTML as index.html (reads ?payload=)
fs.mkdirSync(path.join(dist, 'verse'), { recursive: true });
fs.writeFileSync(path.join(dist, 'verse', 'index.html'), alea);
execSync(`cd "${path.join(dist, "verse")}" && python3 -c "import zipfile;z=zipfile.ZipFile('../${slug}-verse.zip','w',zipfile.ZIP_DEFLATED);z.write('index.html')"`);
const sz = fs.statSync(path.join(dist, 'aleatory', slug + '.html')).size;
const gz = execSync(`gzip -9 -c "${path.join(dist, 'aleatory', slug + '.html')}" | wc -c`).toString().trim();
console.log(`${slug}: aleatory html ${sz} B (gzip ${gz} B), zips written`);
