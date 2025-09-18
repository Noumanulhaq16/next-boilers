import { PrismaClient } from '@prisma/client';
import { Logger } from 'helpers/logger.helper';
import { sportData } from './seedData';

export default async function seedDataBase(dbInstance: PrismaClient) {
    try {
        await PopulateSportTable();
        // await applyinitialApplicationSettings();
        Logger.Info('', '[SEED DATABASE]: Seeded!');

        async function PopulateSportTable() {
            const existingSportData = await dbInstance.sport.findFirst({
                select: { id: true },
                where: { deletedAt: null }
            });
            if (!existingSportData) {
                await dbInstance.sport.createMany({ data: sportData });
            }
        }

        // async function applyinitialApplicationSettings() {
        //     const applicationSettings = await dbInstance.applicationSettings.findMany({
        //         where: {
        //             deletedAt: null
        //         }
        //     });
        //     const settingsHashMap = applicationSettings?.reduce(
        //         (prev, next) => ({
        //             ...prev,
        //             [next?.key]: next?.value
        //         }),
        //         {}
        //     );
        //     const applicationSettingsKeysArray = Object.values(ApplicationSettingsKey);
        //     const settingsPromises = [];
        //     for (let settingKey of applicationSettingsKeysArray) {
        //         if (!settingsHashMap?.hasOwnProperty(settingKey)) {
        //             settingsPromises.push(
        //                 dbInstance.applicationSettings.create({
        //                     data: {
        //                         key: settingKey,
        //                         value: JSON.stringify({})
        //                     }
        //                 })
        //             );
        //         }
        //     }
        //     await Promise.all(settingsPromises);
        // }
    } catch (err) {
        Logger.Error(err, '[SEED DATABASE]: ERROR');
    }
}
