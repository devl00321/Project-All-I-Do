const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'routes', 'api.js');
let content = fs.readFileSync(apiPath, 'utf8');

// The replacement auth routes block
const newAuthRoutes = `
// --- AUTH & PROFILE ROUTES ---
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Customer Register
router.post('/customer/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'User already exists' });
    
    const user = await db.User.create({
      name, email, password, role: 'CUSTOMER', status: 'APPROVED'
    });
    
    res.status(201).json({
      token: generateToken(user.id),
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email, role: 'CUSTOMER' } });
    if (user && (await user.matchPassword(password))) {
      res.json({ token: generateToken(user.id), user });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/customer/me
router.get('/customer/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Dealer Register
router.post('/dealer/register', upload.fields([
  { name: 'face_photo', maxCount: 1 },
  { name: 'aadhaar_photo', maxCount: 1 },
  { name: 'pan_photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, city, aadhaar_id, pan_id, voter_id } = req.body;
    
    const face_photo_url = req.files['face_photo'] ? \`/uploads/kyc/\${req.files['face_photo'][0].filename}\` : null;
    const aadhaar_photo_url = req.files['aadhaar_photo'] ? \`/uploads/kyc/\${req.files['aadhaar_photo'][0].filename}\` : null;
    const pan_photo_url = req.files['pan_photo'] ? \`/uploads/kyc/\${req.files['pan_photo'][0].filename}\` : null;

    const user = await db.User.create({
      name, email, password, city, aadhaar_id, pan_id, voter_id,
      face_photo_url, aadhaar_photo_url, pan_photo_url,
      role: 'DEALER',
      edit_permission_status: 'NONE',
      status: 'PENDING'
    });

    res.status(201).json({ message: "Registered successfully! Waiting for HQ approval.", user });
  } catch (error) {
    console.error("Error registering dealer:", error);
    res.status(500).json({ error: "Could not register dealer" });
  }
});

// Dealer Login
router.post('/dealer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email, role: 'DEALER' } });
    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'APPROVED') {
        return res.status(401).json({ error: 'Account pending HQ approval or rejected' });
      }
      res.json({ token: generateToken(user.id), user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// HQ Login
router.post('/hq/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hq = await db.User.findOne({ where: { email, role: 'HQ' } });
    
    // In some cases HQ might not be hashed yet if seeded directly, but let's assume it works normally.
    // We will bypass bcrypt for 'hq@allido.com' temporarily if needed, but let's use standard.
    // For now we check bcrypt, if it fails, maybe check raw if we want a fallback.
    let valid = false;
    if (hq) {
      valid = await hq.matchPassword(password);
      if (!valid && hq.password === password) { 
        // Fallback for unhashed seeded users
        valid = true;
        // Hash it for next time
        hq.password = password; 
        await hq.save();
      }
    }
    
    if (valid) {
      res.json({ token: generateToken(hq.id), user: hq });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/hq/applications
router.get('/hq/applications', async (req, res) => {
  try {
    const pending = await db.User.findAll({ where: { role: 'DEALER', status: 'PENDING' }});
    res.json(pending);
  } catch(error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// PUT /api/hq/applications/:id/action
router.put('/hq/applications/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Not found" });
    
    user.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await user.save();
    res.json({ message: \`\${action} successful\`, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// GET /api/dealer/profile
router.get('/dealer/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/dealer/profile/request-edit
router.post('/dealer/profile/request-edit', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    
    user.edit_permission_status = 'REQUESTED';
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to request edit" });
  }
});

// PUT /api/dealer/profile
router.put('/dealer/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    
    if (user.edit_permission_status !== 'GRANTED') {
      return res.status(403).json({ error: "Edit permission not granted" });
    }

    const { name, email, password, city } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (city) user.city = city;

    // Reset permission after edit
    user.edit_permission_status = 'NONE';
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/hq/requests
router.get('/hq/requests', async (req, res) => {
  try {
    const requests = await db.User.findAll({ 
      where: { edit_permission_status: 'REQUESTED' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to load requests" });
  }
});

// PUT /api/hq/requests/:id
router.put('/hq/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const user = await db.User.findByPk(id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    user.edit_permission_status = action === 'APPROVE' ? 'GRANTED' : 'NONE';
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// --- CORE ROUTES ---
`;

const startIndex = content.indexOf('// --- AUTH & PROFILE ROUTES ---');
const endIndex = content.indexOf('// --- CORE ROUTES ---');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newAuthRoutes + content.substring(endIndex + '// --- CORE ROUTES ---'.length);
  fs.writeFileSync(apiPath, content, 'utf8');
  console.log('Successfully updated api.js');
} else {
  console.log('Markers not found');
}
