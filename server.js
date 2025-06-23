
const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;
  const { threshold, turdSize, alphamax, optTolerance, outlineMode } = req.body;

  const options = {
    threshold: parseInt(threshold || 180),
    turdSize: parseInt(turdSize || 2),
    alphamax: parseFloat(alphamax || 1.0),
    optCurve: true,
    optTolerance: parseFloat(optTolerance || 0.2),
    turnPolicy: 'minority',
    color: 'black'
  };

  const traceFunc = outlineMode === 'outline' ? potrace.trace : potrace.posterize;

  traceFunc(inputPath, options, (err, svg) => {
    fs.unlinkSync(inputPath);
    if (err) {
      console.error('Potrace error:', err);
      return res.status(500).send('Vectorization failed.');
    }
    res.type('image/svg+xml').send(svg);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
