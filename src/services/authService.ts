import { prisma } from "../lib/prisma";

export const getUserByPhone = async (phone: string) => {
    return prisma.user.findUnique({
        where: {
            phone
        }
    })
};