const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// 콤마로 구분된 여러 origin 허용 (예: "http://localhost:5173,https://xxx.onrender.com")
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // 같은 origin 요청 (Postman 등) 허용
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
