const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter();

app.use(express.static('public'));
app.use('/writeups', express.static('writeups'));
app.use('/case-studies', express.static('case-studies'));

app.get('/view-writeup/:slug.html', (req, res) => {
  const slug = req.params.slug;
  const mdPath = path.join(__dirname, 'writeups', slug, `${slug}.md`);
  const templatePath = path.join(__dirname, 'public', 'writeup-template.html');

  fs.readFile(mdPath, 'utf8', (err, md) => {
    if (err) {
      console.error(err);
      res.status(404).send('Writeup not found');
      return;
    }

    fs.readFile(templatePath, 'utf8', (err, template) => {
      if (err) {
        console.error(err);
        res.status(500).send('Could not load template');
        return;
      }

      let html = converter.makeHtml(md);
      html = html.replace(/src="(?!\/|http)([^"]+)"/g, (match, src) => {
        return `src="/writeups/${slug}/${src}"`;
      });
      const title = md.split('\n')[0].replace('# ', '');
      let page = template.replace('<!-- CONTENT -->', html);
      page = page.replace('<!-- TITLE -->', title);
      res.send(page);
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});