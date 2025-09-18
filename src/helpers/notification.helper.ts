import { FirebaseApp } from './firebase.helper';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { SliceArrayIntoChunks } from './util.helper';

//limit is set by firebase. Read docs
const MAX_FCM_TOKENS_PER_MESSAGE = 500;

export async function SendNotifications(
    fcmTokens: string[],
    title: string,
    body: string,
    data: {} = {},
    unreadCount?: number
) {
    const apns = {
        payload: {
            aps: {
                alert: {
                    title: title,
                    body: body
                },
                sound: 'default',
                // ...(unreadCount !== undefined && { badge: unreadCount })
                badge: unreadCount ?? 0
            }
        }
    };
    console.log(unreadCount, 'UNREADCOUNT');
    const app = await FirebaseApp.GetFirebaseApplicationInstance();
    if (app) {
        try {
            const fcmChunks = SliceArrayIntoChunks(fcmTokens, MAX_FCM_TOKENS_PER_MESSAGE);
            const promises = [];

            fcmChunks.map((chunk) => {
                const message: MulticastMessage = {
                    tokens: chunk,
                    ...(data && { data: { data: JSON.stringify(data) } }),
                    notification: {
                        title: title,
                        body: body
                    },
                    android: {
                        notification: {
                            color: '#15092A',
                            icon: 'ic_notification'
                        }
                    },
                    ...(unreadCount !== undefined && {
                        apns
                    })
                };
                promises.push(getMessaging(app).sendEachForMulticast(message));
            });
            await Promise.all(promises);
        } catch (err) {
            console.log('FCM Send Notifications Err', err);
        }
    }
}
