import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export class AuthService {
  static async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 409, message: "Email already registered" };
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash }, // walletBalance defaults to 150 via schema
      select: { id: true, email: true, walletBalance: true },
    });
    return { user, token: this.sign(user.id, user.email) };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw { status: 401, message: "Invalid credentials" };
    return {
      user: { id: user.id, email: user.email, walletBalance: user.walletBalance },
      token: this.sign(user.id, user.email),
    };
  }

  private static sign(id: string, email: string) {
    return jwt.sign({ id, email }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    } as jwt.SignOptions);
  }
}
