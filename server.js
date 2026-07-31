var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');
var crypto = require('crypto');

var app = express();
var PORT = 3000;
var TOKEN_SECRET = crypto.randomBytes(32).toString('hex');

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

var contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);


function loadMessages() {
  try {
    var data = fs.readFileSync(path.join(__dirname, 'messages.json'), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveMessages(messages) {
  try {
    fs.writeFileSync(path.join(__dirname, 'messages.json'), JSON.stringify(messages, null, 2));
    return true;
  } catch (e) {
    return false;
  }
}

function createToken(user) {
  var payload = JSON.stringify({ user: user, exp: Date.now() + 24 * 60 * 60 * 1000 });
  var hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

function verifyToken(token) {
  try {
    var parts = token.split('.');
    if (parts.length !== 2) return null;
    var payload = Buffer.from(parts[0], 'base64').toString();
    var hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64');
    if (hmac !== parts[1]) return null;
    var data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function safeHandler(fn) {
  return function(req, res, next) {
    try {
      fn(req, res, next);
    } catch (err) {
      console.error('HANDLER ERROR:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}

function requireAuth(req, res, next) {
  var header = req.headers['authorization'];
  if (!header || header.indexOf('Bearer ') !== 0) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  var token = header.slice(7);
  var data = verifyToken(token);
  if (!data) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
  req.user = data.user;
  next();
}

app.post('/api/login', loginLimiter, safeHandler(function(req, res) {
  var user = (req.body.username || '').trim();
  var pass = (req.body.password || '').trim();
  if (user === 'nandani' && pass === 'ahmad') {
    var token = createToken(user);
    res.json({ success: true, token: token });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
}));


app.post('/api/message', contactLimiter, safeHandler(function(req, res) {
  var name = (req.body.name || '').trim();
  var email = (req.body.email || '').trim();
  var business_type = (req.body.business_type || '').trim();
  var message = (req.body.message || '').trim();

  if (!name || !email || !business_type || !message) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  if (name.length < 2 || name.length > 100) {
    return res.json({ success: false, message: 'Name must be 2-100 characters' });
  }

  if (email.length > 100) {
    return res.json({ success: false, message: 'Email is too long' });
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ success: false, message: 'Invalid email address' });
  }

  var validTypes = ['E-Commerce', 'Restaurant', 'Hotel', 'Institute', 'Other'];
  if (validTypes.indexOf(business_type) === -1) {
    return res.json({ success: false, message: 'Invalid business type' });
  }

  if (message.length < 10 || message.length > 1000) {
    return res.json({ success: false, message: 'Message must be 10-1000 characters' });
  }

  var messages = loadMessages();
  var newMessage = {
    id: Date.now(),
    name: name,
    email: email,
    business_type: business_type,
    message: message,
    date: new Date().toISOString(),
    read: false
  };
  messages.unshift(newMessage);
  if (!saveMessages(messages)) {
    return res.json({ success: false, message: 'Failed to save message. Try again.' });
  }

  res.json({ success: true, message: 'Message sent successfully!' });
}));

app.get('/api/messages', requireAuth, safeHandler(function(req, res) {
  var messages = loadMessages();
  res.json(messages);
}));

app.delete('/api/message/:id', requireAuth, safeHandler(function(req, res) {
  var id = parseInt(req.params.id);
  var messages = loadMessages();
  messages = messages.filter(function(m) { return m.id !== id; });
  if (!saveMessages(messages)) {
    return res.json({ success: false, message: 'Failed to delete message' });
  }
  res.json({ success: true });
}));

app.put('/api/message/:id/toggle-read', requireAuth, safeHandler(function(req, res) {
  var id = parseInt(req.params.id);
  var messages = loadMessages();
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].id === id) {
      messages[i].read = !messages[i].read;
      break;
    }
  }
  if (!saveMessages(messages)) {
    return res.json({ success: false, message: 'Failed to save changes' });
  }
  res.json({ success: true });
}));

app.use(function(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use('/api/*', function(req, res) {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.get('*', function(req, res) {
  var requestedPath = req.path === '/' ? 'index.html' : req.path;
  var filePath = path.resolve(path.join(__dirname, requestedPath));
  if (filePath.indexOf(path.resolve(__dirname)) !== 0) {
    res.status(403).send('Forbidden');
    return;
  }
  var ext = path.extname(filePath).toLowerCase();
  var types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.apk': 'application/vnd.android.package-archive',
    '.json': 'application/json'
  };

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    res.send(data);
  });
});

process.on('uncaughtException', function(err) {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', function(err) {
  console.error('UNHANDLED REJECTION:', err);
});

app.listen(PORT, function() {
  console.log('Server running at http://localhost:' + PORT);
});
