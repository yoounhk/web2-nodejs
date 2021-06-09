const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const template = require('./lib/template');
const path = require('path');
const sanitizeHtml = require('sanitize-html');


let app = http.createServer(function (request, response) {
        const urlString = 'http://' + request.headers.host + request.url;
        const urlObj = new URL(urlString);
        let title = urlObj.searchParams.get('id');
        let pathname = urlObj.pathname;
        if (pathname === '/') {
            fs.readdir('./data', (err, fileList) => {
                const ul = template.list(fileList);
                let filteredId = title ? path.parse(title).base : '';
                fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
                    let sanitizedTitle = sanitizeHtml(title);
                    let sanitizedDescription = sanitizeHtml(description);
                    let control = `
                        <a href="/create">create</a> 
                        <a href="/update?id=${title}">update</a>
                        <form action="/delete_process" method="post" onsubmit="alert('정말 삭제합니까?')">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                        </form>`;
                    if (title === null) {
                        title = 'Welcome';
                        description = 'Hello, Node.js';
                        control = `<a href="/create">create</a>`;
                    }
                    response.writeHead(200);
                    response.end(template.HTML(title,
                        ul,
                        `<h2>${title}</h2>${description}`,
                        control));
                });
            });
        } else if (pathname === '/create') {
            fs.readdir('./data', (err, fileList) => {
                title = 'WEB - Create';
                const ul = template.list(fileList);
                response.writeHead(200);
                response.end(template.HTML(title, ul, `
                      <form action="/create_process" method="post">
                        <p><input 
                        type="text" 
                        name="title" 
                        placeholder="title"></p>
                        <p>
                          <textarea 
                          name="description" 
                          placeholder="description"></textarea>
                        </p>
                        <p>
                          <input type="submit">
                        </p>
                      </form>
                    `,
                    ''));
            });
        } else if (pathname === '/create_process') {
            let body = '';
            request.on('data', (data) => {
                body += data;
                if (body.length > 1e6) {
                    request.connection.destroy();
                }
            });
            request.on('end', () => {
                let post = qs.parse(body);
                let title = post.title;
                let description = post.description;
                let filteredId = path.parse(title).base;
                fs.writeFile(`data/${filteredId}`, description, 'utf-8', (err) => {
                    if (err) throw err;
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        } else if (pathname === '/update') {
            fs.readdir('./data', (err, fileList) => {
                const ul = template.list(fileList);
                let filteredId = path.parse(title).base;
                fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
                    response.writeHead(200);
                    response.end(template.HTML(title, ul, `
                      <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                          <textarea 
                          name="description" 
                          placeholder="description"
                          >${description}</textarea>
                        </p>
                        <p>
                          <input type="submit">
                        </p>
                      </form>
                    `,
                        ''));
                });
            });
        } else if (pathname === '/update_process') {
            let body = '';
            request.on('data', (data) => {
                body += data;
                if (body.length > 1e6) {
                    request.connection.destroy();
                }
            });
            request.on('end', () => {
                let post = qs.parse(body);
                let title = post.title;
                let description = post.description;
                let filteredId = path.parse(title).base;
                fs.rename(`data/${filteredId}`, `data/${filteredId}`,
                    (err) => {
                        fs.writeFile(`data/${filteredId}`, description, 'utf-8', (err) => {
                            if (err) throw err;
                            response.writeHead(302, {Location: `/?id=${title}`});
                            response.end();
                        });
                    });
            });
        } else if (pathname === '/delete_process') {
            let body = '';
            request.on('data', (data) => {
                body += data;
                if (body.length > 1e6) {
                    request.connection.destroy();
                }
            });
            request.on('end', () => {
                let post = qs.parse(body);
                let id = post.id;
                let filteredId = path.parse(id).base;
                fs.unlink(`data/${filteredId}`, (err) => {
                    if (err) throw err;
                    response.writeHead(302, {Location: '/'});
                    response.end();
                });
            });
        } else {
            response.writeHead(404);
            response.end('Error 404');
        }
    }
);
app.listen(3000);