import { Prisma } from '@prisma/client';

export type TChats = {
    id: number;
}[];

export function FindChats(userId: number) {
    return Prisma.sql`
    select c.id from "Chat" c inner join "ChatParticipant" cp on c.id = cp."chatId" 
    where c."deletedAt" is null
    and cp."deletedAt" is null
    and cp."userId" = ${userId}
    and (c."lastEventId" > cp."lastDeletedEventId" or cp."lastDeletedEventId" is null)
    and c."lastEventId" is not null
    `;
}

// export type TUnreadCount = {
//     unreadCount: number;
// };
export type TUnreadCount = {
    unreadCount: number | null;
};
export function FindUnreadCount(userId: number) {
    return Prisma.sql`
    SELECT
    SUM(
    CASE
      WHEN ce."id" > cp."lastReadEventId" OR cp."lastReadEventId" IS NULL THEN 1
      ELSE 0
    END
    ) AS "unreadCount"
    FROM "ChatParticipant" cp
    JOIN "ChatEvent" ce ON ce."chatId" = cp."chatId"
    WHERE cp."userId" = ${userId}
    AND ce."id" > COALESCE(cp."lastReadEventId", 0)
    AND ce."senderParticipantId" != cp."id";
    `;
}
