import { prisma } from "../lib/prisma";

export const getUserByPhone = async (phone: string) => {
    return prisma.user.findUnique({
        where: {
            phone
        }
    })
};

export const createOtp = async (otpData: any) => {
    return prisma.otp.create({
        data: otpData
    })
};

export const getOtpByPhone = async (phone: string) => {
    return prisma.otp.findUnique({
        where: {
            phone
        }
    })
};

export const updateOtp = async (otpData: any, id: number) => {
    return prisma.otp.update({
        where: { id },
        data: otpData
    })
};

export const createUser = async (userData: any) => {
    return prisma.user.create({
        data: userData
    })
};

export const updateUser = async (userData: any, id: number) => {
    return prisma.user.update({
        where: { id },
        data: userData
    })
};