const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data persistence
const DATA_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const FAVORITES_FILE = path.join(__dirname, 'favorites.json');

// Load users from file if exists
let users = [];
let nextId = 1;

try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const savedData = JSON.parse(data);
    users = savedData.users || [];
    nextId = savedData.nextId || 1;
    console.log('📁 Loaded users from file:', users.length);
  }
} catch (error) {
  console.log('❌ Error loading users file, starting fresh');
}

// Load orders from file if exists
let orders = [];
let nextOrderId = 1;

try {
  if (fs.existsSync(ORDERS_FILE)) {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    const savedData = JSON.parse(data);
    orders = savedData.orders || [];
    nextOrderId = savedData.nextOrderId || 1;
    console.log('📁 Loaded orders from file:', orders.length);
  }
} catch (error) {
  console.log('❌ Error loading orders file, starting fresh');
}

// Load favorites from file if exists
let favorites = [];
try {
  if (fs.existsSync(FAVORITES_FILE)) {
    const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
    const savedData = JSON.parse(data);
    favorites = savedData.favorites || [];
    console.log('📁 Loaded favorites from file:', favorites.length);
  }
} catch (error) {
  console.log('❌ Error loading favorites file, starting fresh');
}

// Function to save users to file
const saveUsersToFile = () => {
  try {
    const data = {
      users,
      nextId
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Users saved to file');
  } catch (error) {
    console.error('❌ Error saving users:', error);
  }
};

// Function to save orders to file
const saveOrdersToFile = () => {
  try {
    const data = {
      orders,
      nextOrderId
    };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Orders saved to file');
  } catch (error) {
    console.error('❌ Error saving orders:', error);
  }
};

// Function to save favorites to file
const saveFavoritesToFile = () => {
  try {
    const data = {
      favorites,
    };
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Favorites saved to file');
  } catch (error) {
    console.error('❌ Error saving favorites:', error);
  }
};

// JWT Secret
const JWT_SECRET = 'quickslot_jwt_secret_key_2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'QuickSlot API is running!' });
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, studentId, email, password } = req.body;

    console.log('📝 Signup attempt:', { fullName, studentId, email });

    // Validation
    if (!fullName || !studentId || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.studentId === studentId);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or student ID' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: nextId++,
      fullName,
      studentId,
      email,
      password: hashedPassword,
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(user);
    saveUsersToFile(); // Save to file
    console.log('✅ User created:', user.fullName);

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return response (without password)
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username });

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Email/Student ID and password are required' });
    }

    // Find user by email or studentId
    const user = users.find(u => u.email === username || u.studentId === username);

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(400).json({ error: 'Invalid email/student ID or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      return res.status(400).json({ error: 'Invalid email/student ID or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', user.fullName);

    // Return user data (without password)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user profile (protected)
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      studentId: user.studentId,
      email: user.email,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (protected)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, studentId, email, phone } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    // Update fields if provided
    if (fullName !== undefined) user.fullName = fullName;
    if (studentId !== undefined) user.studentId = studentId;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    
    user.updatedAt = new Date().toISOString();

    // Update user in array
    users[userIndex] = user;
    saveUsersToFile(); // Save to file

    console.log('✅ Profile updated for:', user.fullName);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password (protected)
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    // Validate current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.updatedAt = new Date().toISOString();

    // Update user in array
    users[userIndex] = user;
    saveUsersToFile(); // Save to file

    console.log('✅ Password changed for:', user.fullName);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user address (protected)
app.put('/api/user/address', authenticateToken, async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    // Update address fields if provided
    if (street !== undefined) user.address.street = street;
    if (city !== undefined) user.address.city = city;
    if (state !== undefined) user.address.state = state;
    if (zipCode !== undefined) user.address.zipCode = zipCode;
    if (country !== undefined) user.address.country = country;
    
    user.updatedAt = new Date().toISOString();

    // Update user in array
    users[userIndex] = user;
    saveUsersToFile(); // Save to file

    console.log('✅ Address updated for:', user.fullName);

    res.json({
      message: 'Address updated successfully',
      address: user.address
    });
  } catch (error) {
    console.error('❌ Update address error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user address (protected)
app.get('/api/user/address', authenticateToken, (req, res) => {
  
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      address: user.address
    });
  } catch (error) {
    console.error('❌ Get address error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Favorites Management Endpoints

// Get user's favorites
app.get('/api/user/favorites', authenticateToken, (req, res) => {
  try {
    const userFavorites = favorites
      .filter(fav => fav.userId === req.user.userId)
      .map(fav => ({
        id: fav.id,
        productId: fav.productId,
        productName: fav.productName,
        productPrice: fav.productPrice,
        productImage: fav.productImage,
        productDescription: fav.productDescription,
        category: fav.category,
        addedAt: fav.addedAt,
      }));

    console.log('❤️ Found', userFavorites.length, 'favorites for user:', req.user.userId);

    res.json({
      favorites: userFavorites,
      total: userFavorites.length,
    });
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add product to favorites
app.post('/api/user/favorites', authenticateToken, async (req, res) => {
  try {
    const { productId, productName, productPrice, productImage, productDescription, category } = req.body;

    console.log('➕ Adding to favorites:', { productId, userId: req.user.userId });

    // Validation
    if (!productId || !productName) {
      return res.status(400).json({ error: 'Product ID and name are required' });
    }

    // Check if already in favorites
    const existingFavorite = favorites.find(
      fav => fav.userId === req.user.userId && fav.productId === productId
    );

    if (existingFavorite) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }

    // Create favorite
    const favorite = {
      id: Date.now().toString(),
      userId: req.user.userId,
      productId,
      productName,
      productPrice: productPrice || '',
      productImage: productImage || '',
      productDescription: productDescription || '',
      category: category || '',
      addedAt: new Date().toISOString(),
    };

    favorites.push(favorite);
    saveFavoritesToFile();

    console.log('✅ Added to favorites:', productName);

    res.status(201).json({
      message: 'Product added to favorites',
      favorite: {
        id: favorite.id,
        productId: favorite.productId,
        productName: favorite.productName,
        productPrice: favorite.productPrice,
        productImage: favorite.productImage,
        category: favorite.category,
        addedAt: favorite.addedAt,
      }
    });

  } catch (error) {
    console.error('❌ Add to favorites error:', error);
    res.status(500).json({ error: 'Server error during adding to favorites' });
  }
});

// Remove product from favorites
app.delete('/api/user/favorites/:productId', authenticateToken, (req, res) => {
  try {
    const productId = req.params.productId;
    const favoriteIndex = favorites.findIndex(
      fav => fav.userId === req.user.userId && fav.productId === productId
    );

    if (favoriteIndex === -1) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    const removedFavorite = favorites.splice(favoriteIndex, 1)[0];
    saveFavoritesToFile();

    console.log('❌ Removed from favorites:', removedFavorite.productName);

    res.json({
      message: 'Product removed from favorites',
      removedFavorite: {
        id: removedFavorite.id,
        productId: removedFavorite.productId,
        productName: removedFavorite.productName,
      }
    });
  } catch (error) {
    console.error('❌ Remove from favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if product is in favorites
app.get('/api/user/favorites/check/:productId', authenticateToken, (req, res) => {
  try {
    const productId = req.params.productId;
    const isFavorite = favorites.some(
      fav => fav.userId === req.user.userId && fav.productId === productId
    );

    res.json({
      isFavorite,
      productId,
    });
  } catch (error) {
    console.error('❌ Check favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Order Management Endpoints

// Create new order (from checkout)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { 
      items, 
      totalAmount, 
      paymentMethod, 
      contactInfo,
      specialInstructions 
    } = req.body;

    console.log('🛒 Creating new order for user:', req.user.userId);

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Create order
    const order = {
      id: nextOrderId++,
      userId: req.user.userId,
      orderNumber: `QS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        owner: item.owner,
        rentalDuration: item.rentalDuration,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      totalAmount,
      paymentMethod,
      contactInfo: {
        fullName: contactInfo.fullName,
        phoneNumber: contactInfo.phoneNumber,
        email: contactInfo.email,
        meetupLocation: contactInfo.meetupLocation,
        deliveryAddress: contactInfo.deliveryAddress,
      },
      specialInstructions: specialInstructions || '',
      status: 'pending', // pending, confirmed, in_progress, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(order);
    saveOrdersToFile(); // Save to file

    console.log('✅ Order created:', order.orderNumber);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({ error: 'Server error during order creation' });
  }
});

// Get user's current orders (pending, confirmed, in_progress)
app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
  try {
    const userOrders = orders
      .filter(order => order.userId === req.user.userId)
      .filter(order => ['pending', 'confirmed', 'in_progress'].includes(order.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

    console.log('📦 Found', userOrders.length, 'current orders for user:', req.user.userId);

    res.json({
      orders: userOrders,
      total: userOrders.length,
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's order history (completed, cancelled)
app.get('/api/orders/history', authenticateToken, (req, res) => {
  try {
    const userOrders = orders
      .filter(order => order.userId === req.user.userId)
      .filter(order => ['completed', 'cancelled'].includes(order.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

    console.log('📚 Found', userOrders.length, 'historical orders for user:', req.user.userId);

    res.json({
      orders: userOrders,
      total: userOrders.length,
    });
  } catch (error) {
    console.error('❌ Get order history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific order details
app.get('/api/orders/:orderId', authenticateToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = orders.find(o => o.id === orderId && o.userId === req.user.userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        contactInfo: order.contactInfo,
        specialInstructions: order.specialInstructions,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    });
  } catch (error) {
    console.error('❌ Get order details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (for testing/demo purposes)
app.put('/api/orders/:orderId/status', authenticateToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;
    const orderIndex = orders.findIndex(o => o.id === orderId && o.userId === req.user.userId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    saveOrdersToFile();

    console.log('✅ Order status updated:', orders[orderIndex].orderNumber, '->', status);

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: orders[orderIndex].id,
        orderNumber: orders[orderIndex].orderNumber,
        status: orders[orderIndex].status,
      }
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (for debugging)
app.get('/api/debug/users', (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      studentId: u.studentId,
      email: u.email,
      phone: u.phone,
      address: u.address,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }))
  });
});

// Debug endpoint to see passwords (hashed)
app.get('/api/debug/users-with-passwords', (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      studentId: u.studentId,
      email: u.email,
      password: u.password, // Hashed password
      phone: u.phone
    }))
  });
});

// Debug Endpoint to see all orders
app.get('/api/debug/orders', (req, res) => {
  res.json({
    totalOrders: orders.length,
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
    }))
  });
});

// Debug endpoint to see all favorites
app.get('/api/debug/favorites', (req, res) => {
  res.json({
    totalFavorites: favorites.length,
    favorites: favorites.map(f => ({
      id: f.id,
      userId: f.userId,
      productId: f.productId,
      productName: f.productName,
      addedAt: f.addedAt,
    }))
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 QuickSlot Backend Server Started!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Debug users: http://localhost:${PORT}/api/debug/users`);
  console.log(`📦 Debug orders: http://localhost:${PORT}/api/debug/orders`);
  console.log(`❤️ Debug favorites: http://localhost:${PORT}/api/debug/favorites`);
  console.log(`🔐 Debug passwords: http://localhost:${PORT}/api/debug/users-with-passwords`);
  console.log('\n📋 Available Endpoints:');
  console.log('POST /api/auth/signup - User registration');
  console.log('POST /api/auth/login - User login');
  console.log('GET  /api/user/profile - Get user profile (protected)');
  console.log('PUT  /api/user/profile - Update user profile (protected)');
  console.log('PUT  /api/user/change-password - Change password (protected)');
  console.log('GET  /api/user/address - Get user address (protected)');
  console.log('PUT  /api/user/address - Update user address (protected)');
  console.log('GET  /api/user/favorites - Get user favorites (protected)');
  console.log('POST /api/user/favorites - Add to favorites (protected)');
  console.log('DELETE /api/user/favorites/:productId - Remove from favorites (protected)');
  console.log('GET  /api/user/favorites/check/:productId - Check favorite (protected)');
  console.log('POST /api/orders - Create new order (protected)');
  console.log('GET  /api/orders/my-orders - Get current orders (protected)');
  console.log('GET  /api/orders/history - Get order history (protected)');
  console.log('GET  /api/orders/:orderId - Get order details (protected)');
  console.log('PUT  /api/orders/:orderId/status - Update order status (protected)');
});
