import { ApiProperty } from '@nestjs/swagger';
import { UserResponseModel } from './model';

export default class GetMeResponseDTO {
    @ApiProperty()
    user: UserResponseModel;
}
