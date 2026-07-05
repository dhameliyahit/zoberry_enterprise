import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type NextRequest } from "next/server";
import { StorefrontUser } from "@/lib/storefront-models/User";

const PASSWORD_SALT_ROUNDS = 10;

function getAuthSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be configured");
  }

  return secret;
}

export function createCustomerToken(userId: string) {
  return jwt.sign({ id: userId }, getAuthSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyCustomerToken(token: string) {
  const decoded = jwt.verify(token, getAuthSecret()) as { id?: string };

  if (!decoded.id) {
    throw new Error("Invalid token payload");
  }

  return decoded.id;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export function getBearerToken(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
}

export async function requireAuthenticatedUser(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Authentication required");
  }

  const userId = verifyCustomerToken(token);
  const user = await StorefrontUser.findById(userId);

  if (!user || !user.isActive) {
    throw new Error("User not found");
  }

  return user;
}

export function sanitizeUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  role: string;
  image?: string;
  isActive: boolean;
  addresses?: unknown[];
  createdAt?: Date;
}) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    image: user.image || "",
    isActive: user.isActive,
    addresses: user.addresses || [],
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  };
}

export function buildAuthResponse(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  image?: string;
}) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image || "",
    token: createCustomerToken(user._id.toString()),
  };
}
