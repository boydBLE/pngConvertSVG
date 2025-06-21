const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;
  const traceOptions = {
    threshold: parseInt(req.body.threshold || 180),
    turdSize: parseInt(req.body.turdSize || 2),
    alphamax: parseFloat(req.body.alphamax || 1.0),
    optCurve: req.body.optCurve === 'true',
    optTolerance: parseFloat(req.body.optTolerance || 0.2),
    turnPolicy: req.body.turnPolicy || 'minority',
    invert: req.body.invert === 'true'
  };

  potrace.trace(inputPath, traceOptions, (err, svg) => {
    fs.unlinkSync(inputPath);
    if (err) {
      console.error('Potrace error:', err);
      return res.status(500).send('Error processing image.');
    }
    res.type('image/svg+xml').send(svg);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
