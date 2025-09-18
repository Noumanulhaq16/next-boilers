import { Prisma, SportGender, SportType } from '@prisma/client';

export const sportData: Array<Prisma.SportCreateManyInput> = [
    {
        title: 'Boxing',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Golf',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Gymnastics',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Mixed Martial Arts',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Swimming',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Track & Field',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Tennis',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Wrestling',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Cross Country',
        type: SportType.INDIVIDUAL,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Basketball',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Baseball',
        type: SportType.TEAM,
        sportGender: []
    },
    {
        title: 'Football',
        type: SportType.TEAM,
        sportGender: []
    },
    {
        title: 'Hockey',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'LaCrosse',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Rugby',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Soccer',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Softball',
        type: SportType.TEAM,
        sportGender: [SportGender.GIRL]
    },
    {
        title: 'Flag Football',
        type: SportType.TEAM,
        sportGender: [SportGender.GIRL]
    },
    {
        title: 'Water Polo',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    },
    {
        title: 'Volleyball',
        type: SportType.TEAM,
        sportGender: [SportGender.BOY, SportGender.GIRL]
    }
];
