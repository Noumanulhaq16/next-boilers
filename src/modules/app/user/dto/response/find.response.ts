import { ApiProperty } from '@nestjs/swagger';
import { UserDetailsResponseModel } from './model';

export default class FindUsersResponseDTO {
    @ApiProperty({ isArray: true, type: UserDetailsResponseModel })
    data: UserDetailsResponseModel[];

    @ApiProperty()
    count: number;
}
