import { SocketEventType } from '../../../constants';
import BaseSocketEvent from './base.event';

export default class SubscriptionEvents extends BaseSocketEvent {
    data: any = {};
    static eventName: string = SocketEventType.SUBSCRIPTION_STATUS;
    GetName(): string {
        return SubscriptionEvents.eventName;
    }
    GetData() {
        return this.data;
    }
}
