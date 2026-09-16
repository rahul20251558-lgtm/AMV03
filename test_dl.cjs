const { generateAndDownloadMLTDocx } = require('./dist/server.cjs'); // Cannot require, it uses DOM/Blob which isn't easily available in Node.
