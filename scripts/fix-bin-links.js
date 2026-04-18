const fs = require('fs');
const path = require('path');

const binDir = path.join('node_modules', '.bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}
const bins = {
  next: 'next/dist/bin/next',
  esbuild: 'esbuild/bin/esbuild',
  firebase: 'firebase-tools/lib/bin/firebase.js',
};

for (const [name, rel] of Object.entries(bins)) {
  const binPath = path.join(binDir, name);
  if (!fs.existsSync(binPath)) {
    try {
      fs.symlinkSync(path.join('..', rel), binPath);
    } catch (e) {
      fs.writeFileSync(binPath, '#!/bin/sh\nbasedir=$(dirname "$0")\nexec node "$basedir/../' + rel + '" "$@"\n');
    }
  }
  const cmdPath = path.join(binDir, name + '.cmd');
  if (!fs.existsSync(cmdPath)) {
    const winRel = rel.replace(/\//g, '\\');
    fs.writeFileSync(cmdPath, '@echo off\r\nnode "%~dp0..\\' + winRel + '" %*\r\n');
  }
}
