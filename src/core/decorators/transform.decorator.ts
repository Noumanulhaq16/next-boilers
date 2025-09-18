import { Transform } from 'class-transformer';

export function TrimString() {
    return Transform(({ value }) => (value && typeof value == 'string' ? value.trim() : value));
}

export function ParseToBoolean() {
    return Transform(({ value }) => (String(value).toLowerCase() === 'true' ? true : false));
}

export function ToLowerCase() {
    return Transform(({ value }) =>
        value && typeof value == 'string' ? value.toLowerCase() : value
    );
}

export function ParseToInt() {
    return Transform(({ value }) => (value && typeof value == 'string' ? parseInt(value) : value));
}

export function ParseToFloat() {
    return Transform(({ value }) =>
        value && typeof value == 'string' ? parseFloat(value) : value
    );
}
