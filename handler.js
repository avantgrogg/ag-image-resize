const Sharp = require('sharp');
const ImageFetcher = require('./image-fetcher');
const ImageResizer = require('./image-resizer');

module.exports.resizeImage = (event, context, callback) => {
  const imageFetcher = new ImageFetcher(process.env.BUCKET);
  const imageResizer = new ImageResizer(Sharp);
  const fileName = event.queryStringParameters && event.queryStringParameters.f;
  const quality = event.queryStringParameters && +event.queryStringParameters.q || 80;
  const size = {
    w: event.queryStringParameters && +event.queryStringParameters.w || 800,
    h: event.queryStringParameters && +event.queryStringParameters.h || null,
  };
  return imageFetcher.fetchImage(fileName)
    .then(data => 
      imageResizer.resize(data.image, size, quality))
    .then(data => {
      const contentType = data.contentType;
      const img = new Buffer(data.image.buffer, 'base64');
      callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': contentType },
        body: img.toString('base64'),
        isBase64Encoded: true,
      });
    })
    .catch(error => {
      console.error('Error:', error);
      callback(null, error);
    });
};