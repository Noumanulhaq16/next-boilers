import { ApiProperty } from '@nestjs/swagger';
import { ChatEventResponseModel, ChatResponseModel } from './model';

export class FindChatsResponseDTO {
    @ApiProperty({ isArray: true, type: ChatResponseModel })
    data: ChatResponseModel[];

    @ApiProperty()
    count: number;
}

export class FindChatEventsResponseDTO {
    @ApiProperty({ isArray: true, type: ChatEventResponseModel })
    data: ChatEventResponseModel[];

    @ApiProperty()
    count: number;
}

export class UnreadCount {
    count: number;
}
