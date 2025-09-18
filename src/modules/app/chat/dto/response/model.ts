import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatType } from '@prisma/client';
import { MediaResponseModel } from 'modules/app/media/dto/response/model';
import { UserResponseModel } from 'modules/app/user/dto/response/model';

export class ChatEventAttachmentResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    eventId?: number;

    @ApiProperty()
    mediaId?: number;

    @ApiProperty({ type: MediaResponseModel })
    media?: MediaResponseModel;
}

export class ChatEventResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    content: string;

    @ApiProperty()
    chatId: number;

    @ApiProperty()
    senderParticipantId: number;

    @ApiProperty()
    isFromSystem: boolean;

    @ApiPropertyOptional()
    chat?: Partial<ChatResponseModel>;

    @ApiProperty()
    senderParticipant?: Partial<ChatParticipantResponseModel>;

    @ApiProperty({ isArray: true, type: ChatEventAttachmentResponseModel })
    attachments?: ChatEventAttachmentResponseModel[];
}

export class ChatParticipantResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    chatId: number;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    lastReadEventId: number;

    @ApiProperty()
    lastDeliveredEventId: number;

    @ApiProperty()
    user?: Partial<UserResponseModel>;

    @ApiPropertyOptional()
    lastReadEvent?: ChatEventResponseModel;

    @ApiPropertyOptional()
    lastDeliveredEvent?: ChatEventResponseModel;

    @ApiPropertyOptional()
    lastDeletedEventId?: number;
}

export class ChatResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty({ enum: ChatType })
    type: ChatType;

    @ApiProperty()
    lastEventId: number;

    @ApiProperty({ isArray: true, type: ChatParticipantResponseModel })
    participants: ChatParticipantResponseModel[];

    @ApiProperty({ type: ChatEventResponseModel })
    lastEvent?: ChatEventResponseModel;

    @ApiPropertyOptional()
    blockedBy?: number;
}
