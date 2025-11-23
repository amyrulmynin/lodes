import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database file paths
const DB_FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  affiliates: path.join(DATA_DIR, 'affiliates.json'),
  products: path.join(DATA_DIR, 'products.json'),
  sales: path.join(DATA_DIR, 'sales.json'),
  withdrawals: path.join(DATA_DIR, 'withdrawals.json'),
  tracking: path.join(DATA_DIR, 'tracking.json'),
  settings: path.join(DATA_DIR, 'settings.json'),
};

// Initialize database files with default data
function initializeDatabase() {
  // Admin users
  if (!fs.existsSync(DB_FILES.users)) {
    const defaultAdmin = {
      id: uuidv4(),
      email: 'admin@lodes.com',
      // Password: admin123 (hashed with bcrypt)
      password: '$2b$10$Yos4FdBw9KOf9LK6WyCTmuxy8fxglVzShWBnxX7zbOcreYAipk4M.',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    writeData('users', [defaultAdmin]);
  }

  // Affiliates
  if (!fs.existsSync(DB_FILES.affiliates)) {
    writeData('affiliates', []);
  }

  // Products
  if (!fs.existsSync(DB_FILES.products)) {
    const sampleProducts = [
      {
        id: uuidv4(),
        name: 'Chocolate Cake',
        price: 45,
        description: 'Rich chocolate cake with premium cocoa',
        image: '/images/chocolate-cake.jpg',
        commissionPercent: 10,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Tiramisu',
        price: 38,
        description: 'Classic Italian tiramisu dessert',
        image: '/images/tiramisu.jpg',
        commissionPercent: 12,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    writeData('products', sampleProducts);
  }

  // Sales
  if (!fs.existsSync(DB_FILES.sales)) {
    writeData('sales', []);
  }

  // Withdrawals
  if (!fs.existsSync(DB_FILES.withdrawals)) {
    writeData('withdrawals', []);
  }

  // Tracking
  if (!fs.existsSync(DB_FILES.tracking)) {
    writeData('tracking', []);
  }

  // Settings
  if (!fs.existsSync(DB_FILES.settings)) {
    const defaultSettings = {
      adminWhatsApp: '60123456789',
      minWithdrawal: 50,
      companyName: 'Lodes Desserts',
      googleSheetId: '',
    };
    writeData('settings', defaultSettings);
  }
}

// Read data from file
export function readData(collection: keyof typeof DB_FILES) {
  try {
    if (!fs.existsSync(DB_FILES[collection])) {
      initializeDatabase();
    }
    const data = fs.readFileSync(DB_FILES[collection], 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return collection === 'settings' ? {} : [];
  }
}

// Write data to file
export function writeData(collection: keyof typeof DB_FILES, data: any) {
  try {
    fs.writeFileSync(DB_FILES[collection], JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${collection}:`, error);
    return false;
  }
}

// Generic CRUD operations
export const db = {
  // Create
  create: (collection: keyof typeof DB_FILES, item: any) => {
    const data = readData(collection);
    const newItem = {
      id: uuidv4(),
      ...item,
      createdAt: new Date().toISOString(),
    };
    data.push(newItem);
    writeData(collection, data);
    return newItem;
  },

  // Read all
  findAll: (collection: keyof typeof DB_FILES) => {
    return readData(collection);
  },

  // Read one
  findOne: (collection: keyof typeof DB_FILES, id: string) => {
    const data = readData(collection);
    return data.find((item: any) => item.id === id);
  },

  // Find by condition
  findWhere: (collection: keyof typeof DB_FILES, condition: (item: any) => boolean) => {
    const data = readData(collection);
    return data.filter(condition);
  },

  // Update
  update: (collection: keyof typeof DB_FILES, id: string, updates: any) => {
    const data = readData(collection);
    const index = data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
      writeData(collection, data);
      return data[index];
    }
    return null;
  },

  // Delete
  delete: (collection: keyof typeof DB_FILES, id: string) => {
    const data = readData(collection);
    const filtered = data.filter((item: any) => item.id !== id);
    writeData(collection, filtered);
    return true;
  },
};

// Initialize on import
initializeDatabase();

export default db;
