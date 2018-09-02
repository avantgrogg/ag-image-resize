const app = require('express')();
const bodyParser = require('body-parser');
const ImageFetcher = require('./image-fetcher');
const Sharp = require('sharp');
const ImageResizer = require('./image-resizer');

const PORT = 3000;
const displayStatus = () => (
    {
        status: `OK`, 
    }
);

app.use(bodyParser.json());
app.get('/status', (req, res) => {
  res.status(200).send(displayStatus());
});
app.get('/fetch-image', (req, res) => {
    const imageFetcher = new ImageFetcher(process.env.BUCKET);
    const fileName = req.query && req.query.f;
    return imageFetcher
      .fetchImage(fileName)
      .then(data => {
        const img = new Buffer(data.image.buffer, 'base64');
        res.writeHead(200, {
          'Content-Type': data.contentType
        });
        res.end(img);
      })
      .catch(error => {
        console.error(error);
        res.status(400).send(error.message || error);
      });
  });

  app.get('/resize-image', (req, res) => {
    const imageFetcher = new ImageFetcher(process.env.BUCKET);
    const imageResizr = new ImageResizer(Sharp);
    const fileName = req.query && req.query.f;
    const quality = req.query && +req.query.q || 80;
    const size = {
      w: req && +req.query.w || 800,
      h: req && +req.query.h || null,
    };
    return imageFetcher
      .fetchImage(fileName)
      .then(data => imageResizr.resize(data.image, size, quality))
      .then(data => {
        const img = new Buffer(data.image.buffer, 'base64');
        res.writeHead(200, {
          'Content-Type': data.contentType
        });
        res.end(img);
      })
      .catch(error => {
        console.error('Error:', error);
        res.status(400).send(error.message || error);
      });
  });

const server = app.listen(PORT, () =>
  console.log('Listening on ' +
    `http://localhost:${server.address().port}`)
);