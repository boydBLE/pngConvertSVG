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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve index.html from root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/vectorize', upload.single('image'), (req, res) => {
  const inputPath = req.file.path;

  const {
    threshold = 180,
    turdSize = 2,
    alphamax = 1.0,
    optTolerance = 0.2,
    turnPolicy = 'minority',
    invert = false,
    optCurve = true,
    outlineShapes,
    outerOutlineOnly
  } = req.body;

  const traceOptions = {
    threshold: parseInt(threshold),
    turdSize: parseInt(turdSize),
    alphamax: parseFloat(alphamax),
    optTolerance: parseFloat(optTolerance),
    turnPolicy: turnPolicy,
    invert: invert === 'true',
    optCurve: optCurve === 'true'
  };

  const useOutlineOnly = outerOutlineOnly === 'true';
  const useOutlineShapes = outlineShapes === 'true';

  const traceMethod = useOutlineOnly
    ? potrace.posterize // or any method to simulate outer contour only
    : potrace.trace;

  traceMethod(inputPath, traceOptions, (err, svg) => {
    fs.unlinkSync(inputPath); // remove uploaded file

    if (err) {
      console.error('Potrace error:', err);
      return res.status(500).send('Error processing image.');
    }

    // If user wants outer contour only, filter paths (optional refinement)
    if (useOutlineOnly) {
      svg = svg.replace(/<path[^>]*d="[^"]*"[^>]*\/>/g, (match, offset, fullString) => {
        return match.includes('fill') ? '' : match;
      });
    }

    res.type('image/svg+xml').send(svg);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
