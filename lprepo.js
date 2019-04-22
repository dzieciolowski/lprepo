#!/usr/bin/env node

const minimist = require('minimist'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    path = require('path')

const args = minimist(process.argv.slice(2), {
    default: {
        host: 'localhost',
        port: 3000,
        plugins: 'plugins'
    }
})

const filetype = new RegExp('(.jar|.zip)$')

const requestHandler = (req, res) => {
    const pathname = url.parse(req.url).pathname
    const filename = path.join(args.plugins, pathname)

    if (pathname === '/' && fs.existsSync(filename)) {
        const files = fs.readdirSync(args.plugins).filter(file => filetype.test(file))
        res.end(`<plugins>\n` + files.map(file => `<plugin id="${file}" url="http://${args.host}:${args.port}/${file}"/>`).join('\n') + `\n</plugins>`)
    } else if (fs.existsSync(filename) && filetype.test(filename)) {
        fs.createReadStream(filename).pipe(res)
    } else {
        res.writeHead(404).end()
	};
}

const server = http.createServer(requestHandler)

server.listen(args.port, () => {console.log(`Local Plugin Repository listening on ${args.host}:${args.port}, hosting jar/zip files from '${args.plugins}'.`)})