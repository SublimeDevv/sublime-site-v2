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

    console.log(firstName, lastName, email, password);

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

    const findRole = await prisma.role.findFirst({
      where: {
        name: "user",
      },
    });

    if (!findRole) {
      const newRole = await prisma.role.create({
        data: {
          name: "user",
        },
      });

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: newRole.id,
        },
      });
    } else {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: findRole.id,
        },
      });
    }

    return ResponseHelper.created(
      { userId: user.id, userName: user.userName },
      SUCCESS_MESSAGES.REGISTER_SUCCESS
    );
  });
}
