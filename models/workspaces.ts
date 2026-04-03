"use server"

import { prisma } from "@/lib/db"
import { Workspace } from "@/prisma/client"

export const getOrCreateDefaultWorkspace = async (userId: string, userName: string): Promise<Workspace> => {
  const existingMember = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  })

  if (existingMember) {
    return existingMember.workspace
  }

  // Create default workspace
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: `${userName}'s Workspace`,
        ownerId: userId,
      },
    })

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: userId,
        role: "owner",
      },
    })

    return workspace
  })
}

export const getUserWorkspaces = async (userId: string) => {
  const members = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
  })

  return members.map(m => m.workspace)
}
