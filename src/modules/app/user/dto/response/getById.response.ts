import { UserDetailsResponseModel } from './model';

export default class GetUserByIdResponseDTO extends UserDetailsResponseModel {
    canChat?: boolean;
}
