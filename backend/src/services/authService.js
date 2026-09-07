const bcrypt = require('bcryptjs');
const { User, Wallet, StudentCard } = require('../models');
const JwtService = require('./jwtService');
const { ApiError } = require('../middleware/errorHandler');

class AuthService {
  static async register(registerRequest) {
    const { username, password, fullName, studentId } = registerRequest;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new ApiError(400, 'Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      fullName,
      studentId,
      guest: false
    });

    // Create wallet for real user
    await Wallet.create({
      userId: user.id,
      balance: 0.00,
      currency: 'ZAR'
    });

    // Create student card
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);

    await StudentCard.create({
      userId: user.id,
      cardNumber: `CARD-${user.id}-${Date.now()}`,
      status: 'ACTIVE',
      expiryDate: expiryDate.toISOString().split('T')[0]
    });

    // Generate token
    const token = JwtService.generateToken(user.id, user.username, user.role, false);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
        isGuest: user.guest
      }
    };
  }

  static async login(loginRequest) {
    const { username, password } = loginRequest;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new ApiError(401, 'Invalid username or password');
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password || '');
    if (!passwordMatch) {
      throw new ApiError(401, 'Invalid username or password');
    }

    // Generate token
    const token = JwtService.generateToken(user.id, user.username, user.role, false);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
        isGuest: user.guest
      }
    };
  }

  static async loginAsGuest() {
    // Create a temporary guest user
    const guestUsername = `guest-${Date.now()}`;
    
    const user = await User.create({
      username: guestUsername,
      password: null,
      fullName: 'Guest User',
      guest: true,
      role: 'STUDENT'
    });

    // Generate token for guest
    const token = JwtService.generateToken(user.id, user.username, user.role, true);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
        isGuest: user.guest
      }
    };
  }

  static async forgotPassword(forgotPasswordRequest) {
    const { username } = forgotPasswordRequest;

    const user = await User.findOne({ where: { username } });

    // Always return generic success message for security
    return {
      message: 'If a matching account exists, a password reset link will be sent to your email.'
    };
  }
}

module.exports = AuthService;
