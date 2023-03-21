import crypto from "crypto";
import { promisify } from "util";
import uniqid from "uniqid";
import { Request } from "express";
import { UserDocument, UserModel } from "../models/UserModel";
import { findOrganizationsByMemberId } from "../models/OrganizationModel";
import { UserLoginNotificationEvent } from "../events/notification-events";
import { createEvent } from "../models/EventModel";
import { AuditableUserProperties } from "../events/event-types";
import { usingOpenId, validatePasswordFormat } from "./auth";

const SALT_LEN = 16;
const HASH_LEN = 64;

const scrypt = promisify(crypto.scrypt);

export async function getUserByEmail(email: string) {
  return UserModel.findOne({
    email,
  });
}

export async function getUserById(id: string) {
  return UserModel.findOne({
    id,
  });
}

export async function getUsersByIds(ids: string[]) {
  return UserModel.find({
    id: { $in: ids },
  });
}

async function hash(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN).toString("hex");
  const derivedKey = await (scrypt(
    password,
    salt,
    HASH_LEN
  ) as Promise<Buffer>);
  return salt + ":" + derivedKey.toString("hex");
}

export async function verifyPassword(
  user: UserDocument,
  password: string
): Promise<boolean> {
  if (!user.passwordHash) return false;
  const [salt, key] = user.passwordHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await (scrypt(
    password,
    salt,
    HASH_LEN
  ) as Promise<Buffer>);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

export async function updatePassword(userId: string, password: string) {
  validatePasswordFormat(password);
  const passwordHash = await hash(password);

  await UserModel.updateOne(
    {
      id: userId,
    },
    {
      $set: {
        passwordHash,
      },
    }
  );
}

export async function createUser(
  name: string,
  email: string,
  password?: string,
  verified: boolean = false
) {
  let passwordHash = "";

  if (!usingOpenId()) {
    password = validatePasswordFormat(password);
    passwordHash = await hash(password);
  }

  return UserModel.create({
    name,
    email,
    passwordHash,
    id: uniqid("u_"),
    verified,
  });
}

/**
 * Some tracking properties exist on the request object
 * @param req
 */
export const getAuditableUserPropertiesFromRequest = (
  req: Request
): Pick<AuditableUserProperties, "userAgent" | "device" | "ip" | "os"> => {
  const userAgent = (req.headers["user-agent"] as string) || "";
  const device = (req.headers["sec-ch-ua"] as string) || "";
  const os = (req.headers["sec-ch-ua-platform"] as string) || "";
  const ip =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "";

  return {
    userAgent,
    device,
    os,
    ip,
  };
};

/**
 * Track a login event under each organization for a user that has just logged in.
 * @param email
 * @param device
 * @param userAgent
 * @param ip
 * @param os
 * @param userAgent
 * @param ip
 * @param os
 */
export async function trackLoginForUser({
  email,
  device,
  userAgent,
  ip,
  os,
}: {
  email: string;
  device: string;
  userAgent: string;
  ip: string;
  os: string;
}): Promise<void> {
  const user = await getUserByEmail(email);
  if (!user) {
    return;
  }

  const organizations = await findOrganizationsByMemberId(user.id);
  if (!organizations) {
    return;
  }

  const organizationIds = organizations.map((org) => org.id);

  const auditedData: AuditableUserProperties = {
    email: user.email,
    id: user.id,
    name: user.name,
    ip,
    userAgent,
    os,
    device,
  };

  const event: UserLoginNotificationEvent = {
    object: "user",
    event: "user.login",
    user: {
      type: "dashboard",
      email: user.email,
      id: user.id,
      name: user.name,
    },
    data: {
      current: auditedData,
    },
  };

  // Create a login event for all of a user's organizations
  for (const organizationId of organizationIds) {
    await createEvent(organizationId, event);
  }
}
