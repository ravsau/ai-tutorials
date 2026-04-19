const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers (F grade -> A grade)
app.use(helmet());

// Rate limiting (stops cost attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);
