const archiver = require('archiver');
const fs = require('fs');

const srcDir = './src/';
const minifiedDir = '.tmp/';
const buildDir = './build/';

function createFiles() {
  const files = ['index.html', 'sketch.js', 'style.css'];
  if (!fs.existsSync(minifiedDir)) {
    fs.mkdirSync(minifiedDir);
  }
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
  fs.readdirSync(srcDir).forEach((file) => {
    if (files.includes(file)) {
      const f = fs.readFileSync(`${srcDir}${file}`, { encoding: 'utf-8' });
      fs.writeFileSync(`${minifiedDir}${file}`, minifyFile(f), {
        encoding: 'utf-8',
      });
    }
  });
}
function deleteTmp() {
  if (fs.existsSync(minifiedDir)) {
    fs.rmdirSync(minifiedDir, { recursive: true, force: true });
  }
}

async function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

function minifyFile(fileAsString) {
  return require('html-minifier').minify(fileAsString, {
    html5: true,
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
    collapseWhitespace: true,
    removeScriptTypeAttributes: true,
  });
}

async function run() {
  createFiles();
  await zipDirectory(minifiedDir, `${buildDir}build_${Date.now()}.zip`);
  deleteTmp();
}

console.log(`
███████╗ ██████╗██╗     ██╗██████╗ ███████╗███████╗
██╔════╝██╔════╝██║     ██║██╔══██╗██╔════╝██╔════╝
█████╗  ██║     ██║     ██║██████╔╝███████╗█████╗  
██╔══╝  ██║     ██║     ██║██╔═══╝ ╚════██║██╔══╝  
███████╗╚██████╗███████╗██║██║     ███████║███████╗
╚══════╝ ╚═════╝╚══════╝╚═╝╚═╝     ╚══════╝╚══════╝
`);
run('src')
  .then(() => {
    console.log('\x1b[32m', 'Build Succeeded ✨');
  })
  .catch((err) => {
    console.error(err);
    console.error('\x1b[31m', 'Error building project');
  })
  .finally(() => {
    process.exit();
  });
