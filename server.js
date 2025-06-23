const express = require('express');
const multer = require('multer');
const cors = require('cors');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;

  const traceOptions = {
    threshold: parseInt(req.body.threshold || 180),
    turdSize: parseInt(req.body.turdSize || 2),
    alphamax: parseFloat(req.body.alphamax || 1.0),
    optTolerance: parseFloat(req.body.optTolerance || 0.2),
    turnPolicy: req.body.turnPolicy || 'minority',
    invert: req.body.invert === 'true',
    optCurve: req.body.optCurve === 'true'
  };

  const outlineShapes = req.body.outlineShapes === 'true';
  const outerOutlineOnly = req.body.outerOutlineOnly === 'true';

  const done = (err, svg) => {
    fs.unlinkSync(inputPath); // Cleanup uploaded file
    if (err) {
      console.error('Potrace error:', err);
      return res.status(500).send('Error processing image.');
    }
    res.type('image/svg+xml').send(svg);
  };

  if (outerOutlineOnly) {
    potrace.trace(inputPath, traceOptions, done);
  } else if (outlineShapes) {
    potrace.trace(inputPath, traceOptions, done); // Could swap for potrace.posterize if needed
  } else {
    potrace.trace(inputPath, traceOptions, done);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
