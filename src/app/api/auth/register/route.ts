import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import {
  ResponseHelper,
  withErrorHandling,
  SUCCESS_MESSAGES,
} from "@/lib/response";

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return ResponseHelper.forbidden("Registration is not allowed.");
    }

    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return ResponseHelper.missingFields();
    }

    const findByEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (findByEmail) {
      return ResponseHelper.emailExists();
    }

    const findByUserName = await prisma.user.findFirst({
      where: {
        userName: `${firstName} ${lastName}`,
      },
    });

    if (findByUserName) {
      return ResponseHelper.usernameExists();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userName = `${firstName} ${lastName}`.toUpperCase();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: `${firstName} ${lastName}`,
        userName,
      },
    });

    const role = await prisma.role.findFirst({
      where: {
        name: "user",
      },
    });

    if (role) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    return ResponseHelper.created(
      { userId: user.id, userName: user.userName },
      SUCCESS_MESSAGES.REGISTER_SUCCESS
    );
  });
}
