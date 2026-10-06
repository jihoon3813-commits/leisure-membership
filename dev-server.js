const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    const filePath = path.join(ROOT, reqPath);

    if (!filePath.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.end('404 Not Found: ' + reqPath);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });

      fs.createReadStream(filePath).pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ 포트 ${port}번이 이미 사용 중입니다. 다음 포트(${port + 1})로 재시도합니다...`);
      startServer(port + 1);
    } else {
      console.error('서버 오류 발생:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`✨ HD ONE LOUNGE Dev Server running!`);
    console.log(`🌐 사용자 메인 화면: http://localhost:${port}/`);
    console.log(`⚙️  관리자 어드민 화면: http://localhost:${port}/admin.html`);
    console.log(`==================================================\n`);
  });
}

startServer(PORT);
