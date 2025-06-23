const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;

  const outerOnly = req.body.outerOnly === 'true';

  const traceOptions = {
    threshold: parseInt(req.body.threshold || 180),
    turdSize: parseInt(req.body.turdSize || 2),
    alphamax: parseFloat(req.body.alphamax || 1.0),
    optTolerance: parseFloat(req.body.optTolerance || 0.2),
    optCurve: req.body.optCurve === 'true',
    turnPolicy: req.body.turnPolicy || 'minority',
    invert: req.body.invert === 'true'
  };

  // Adjust for outer outline only
  if (outerOnly) {
    traceOptions.turdSize = 100;
    traceOptions.alphamax = 0.0;
    traceOptions.optCurve = false;
    traceOptions.optTolerance = 1.0;
    traceOptions.turnPolicy = 'black';
  }

  potrace.trace(inputPath, traceOptions, (err, svg) => {
    fs.unlinkSync(inputPath); // cleanup
    if (err) {
      console.error("Potrace error:", err);
      return res.status(500).send("Error processing image.");
    }
    res.type('image/svg+xml').send(svg);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
