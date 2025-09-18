import { ValidateIf } from 'class-validator';

export function IsOptionalCustom() {
    return ValidateIf((object, value) => value !== undefined)
}