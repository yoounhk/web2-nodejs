module.exports = {
    HTML: (title, ul, body, control) => {
        return `
            <!doctype html>
            <html>
            <head>
              <title>WEB1 - ${title}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1><a href="/">WEB</a></h1>
              ${ul}
              ${control}
              ${body}
            </body>
            </html>
            `;
    },
    list: (list) => {
        return `<ul>` + list.map(e => {
            return `<li><a href="/?id=${e}">${e}</a></li>`
        }).join('') + `</ul>`;
    }
};