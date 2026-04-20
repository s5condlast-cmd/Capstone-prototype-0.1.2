"use client";

import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_NAME,
  DEMO_ADVISOR_EMAIL,
  DEMO_ADVISOR_NAME,
  DEMO_STUDENT_EMAIL,
  DEMO_STUDENT_NAME,
} from "./config";

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  role: "admin" | "advisor" | "student";
  username?: string;
}

interface StoredUser extends User {
  password: string;
}

export type UserRole = "admin" | "advisor" | "student";

const USERS_KEY = "aip_users";
const SESSION_KEY = "aip_session_user_id";

const DEFAULT_USERS: StoredUser[] = [
  {
    id: "admin-001",
    studentId: "ADMIN001",
    name: DEMO_ADMIN_NAME,
    email: DEMO_ADMIN_EMAIL,
    username: "admin",
    password: "admin",
    role: "admin",
  },
  {
    id: "advisor-001",
    studentId: "ADVISOR001",
    name: DEMO_ADVISOR_NAME,
    email: DEMO_ADVISOR_EMAIL,
    username: "advisor",
    password: "advisor",
    role: "advisor",
  },
  {
    id: "student-001",
    studentId: "STUDENT-001",
    name: DEMO_STUDENT_NAME,
    email: DEMO_STUDENT_EMAIL,
    username: "student",
    password: "student",
    role: "student",
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

function sanitizeUser(user: StoredUser): User {
  const { password, ...safeUser } = user;
  return safeUser;
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) return DEFAULT_USERS;
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return parsed;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
}

function writeUsers(users: StoredUser[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function initializeUsers(): void {
  readUsers();
}

export function getSession(): User | null {
  if (!canUseStorage()) return null;
  initializeUsers();
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const user = readUsers().find((item) => item.id === userId);
  return user ? sanitizeUser(user) : null;
}

export function login(identifier: string, password: string): User | null {
  if (!canUseStorage()) return null;
  initializeUsers();

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const user = readUsers().find(
    (item) =>
      (item.username || "").toLowerCase() === normalizedIdentifier ||
      item.email.toLowerCase() === normalizedIdentifier ||
      item.role.toLowerCase() === normalizedIdentifier
  );

  if (!user || user.password !== password) return null;

  localStorage.setItem(SESSION_KEY, user.id);
  return sanitizeUser(user);
}

export function logout(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
}

export function getUsers(): User[] {
  initializeUsers();
  return readUsers().map(sanitizeUser);
}

export function createUser(data: {
  studentId: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  username?: string;
}): User | null {
  initializeUsers();
  const users = readUsers();
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedStudentId = data.studentId.trim().toLowerCase();
  const username = (data.username?.trim() || data.name.trim().split(" ")[0] || data.role).toLowerCase();

  const exists = users.some(
    (user) =>
      user.email.toLowerCase() === normalizedEmail ||
      user.studentId.toLowerCase() === normalizedStudentId ||
      (user.username || "").toLowerCase() === username
  );

  if (exists) return null;

  const newUser: StoredUser = {
    id: `${data.role}-${Date.now()}`,
    studentId: data.studentId.trim(),
    name: data.name.trim(),
    email: normalizedEmail,
    username,
    password: data.password,
    role: data.role,
  };

  writeUsers([newUser, ...users]);
  return sanitizeUser(newUser);
}

export function deleteUser(id: string): void {
  initializeUsers();
  const users = readUsers().filter((user) => user.id !== id);
  writeUsers(users.length > 0 ? users : DEFAULT_USERS);

  if (canUseStorage() && localStorage.getItem(SESSION_KEY) === id) {
    localStorage.removeItem(SESSION_KEY);
  }
}
