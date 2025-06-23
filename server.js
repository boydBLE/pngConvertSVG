const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;

  const {
    threshold,
    turdSize,
    alphamax,
    strokeWidth,
    strokeColor,
    outlineOnly
  } = req.body;

  const traceOptions = {
    threshold: parseInt(threshold || 180),
    turdSize: parseInt(turdSize || 2),
    alphamax: parseFloat(alphamax || 1.0),
    optCurve: true,
    optTolerance: 0.2,
    turnPolicy: 'minority'
  };

  const drawTrace = outlineOnly === 'true'
    ? potrace.trace
    : potrace.posterize;

  potrace.trace(inputPath, traceOptions, (err, svg) => {
    fs.unlinkSync(inputPath); // delete uploaded file
    if (err) {
      console.error('Potrace error:', err);
      return res.status(500).send('Error processing image.');
    }

    // Add stroke to SVG
    const modifiedSVG = svg.replace(
      /<path /g,
      `<path stroke="${strokeColor || '#000'}" stroke-width="${strokeWidth || 1}" fill="none"`
    );

    res.type('image/svg+xml').send(modifiedSVG);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
