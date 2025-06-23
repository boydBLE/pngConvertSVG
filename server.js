const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;

  const vectorMode = req.body.vectorMode || 'fill'; // 'fill', 'outer', 'all'

  const traceOptions = {
    threshold: parseInt(req.body.threshold || 180),
    turdSize: parseInt(req.body.turdSize || 2),
    alphamax: parseFloat(req.body.alphamax || 1.0),
    optCurve: req.body.optCurve === 'true',
    optTolerance: parseFloat(req.body.optTolerance || 0.2),
    turnPolicy: req.body.turnPolicy || 'minority',
    invert: req.body.invert === 'true',
    color: 'black',
  };

  const traceFn =
    vectorMode === 'outer'
      ? potrace.trace
      : vectorMode === 'all'
      ? potrace.posterize
      : potrace.trace;

  traceFn(inputPath, traceOptions, (err, svg) => {
    fs.unlinkSync(inputPath);
    if (err) return res.status(500).send('Error processing image.');
    res.type('image/svg+xml').send(svg);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
