const UserExceptionMessages = {
    registered: 'user.registered',
    notFound: 'user.not_found',
    emailAlreadyExist: 'user.email_already_exist',
    profilePictureRemoved: 'user.profile_picture_removed',
    blocked: 'user.blocked',
    notAllowed: 'user.not_allowed',
    cannotDelete: 'user.cannot_delete',
    unknownError: 'user.unknown_error',
    operationNotAllowed: 'user.operation_not_allowed',
    alreadyBlocked: 'user.already_blocked'
};

const CategoryExceptionMessages = {
    notFound: 'category.not_found'
};

const CommonExceptionMessages = {
    success: 'common.success',
    updated: 'common.updated',
    deleted: 'common.deleted',
    created: 'common.created',
    verified: 'common.verified',
    errorsNotFound: 'errors.not_found',
    errorsForbidden: 'errors.forbidden',
    errorsFatal: 'errors.fatal',
    errorsBadRequest: 'errors.bad_request',
    errorsUnauthorized: 'errors.unauthorized',
    errorsInvalidValues: 'errors.invalid_values',
    errorsUnidentified: 'errors.unindentified'
};

const DeviceExceptionMessages = {
    deviceNotFound: 'device.not_found',
    deviceFcmUpdated: 'device.fcm_updated'
};

const AuthExceptionMessages = {
    invalidVerificationCode: 'auth.invalid_verification_code',
    newEmailSameAsPrevious: 'auth.new_email_same_as_previous',
    verificationCodeSentOnEmail: 'auth.verification_code_sent_on_email',
    emailChanged: 'auth.email_changed',
    passwordChanged: 'auth.password_changed',
    samePassword: 'auth.same_password',
    wrongPassword: 'auth.wrong_password',
    loggedOut: 'auth.logged_out',
    emailAlreadyExist: 'auth.email_already_exist',
    invalidToken: 'auth.invalid_token',
    invalidTokenCode: 'auth.invalid_token_code',
    expiredToken: 'auth.expired_token',
    oauthInvalidProvider: 'oauth.invalid_provider',
    oauthInvalidToken: 'oauth.invalid_token',
    invalidCredentials: 'auth.invalid_credentials'
};

const MediaExceptionMessages = {
    notAllowed: 'media.not_allowed',
    notFound: 'media.not_found',
    tooLarge: 'media.too_large',
    serviceNotAvailable: 'media.service_not_available',
    uploadSuccess: 'media.upload_success',
    notSupported: 'media.not_supported',
    unknownError: 'media.unknown_error'
};

const NotificationExceptionMessages = {
    notFound: 'notifications.not_found'
};

const PaymentExceptionMessages = {
    settingsInvalid: 'payment_settings.invalid',
    alreadyExist: 'payment.already_exist',
    notFound: 'payment.not_found',
    payoutsUnknownError: 'payouts.unknown_error',
    noPaypalId: 'payment.no_paypalId',
    alreadyOnboardedAccount: 'payment.already_onboarded_account',
    methodNotFound: 'payment.payment_method_not_found',
    alreadyExistPurchaseToken: 'payment.already_exist_purchase_token',
    subscription_non_expired_different_device_type:
        'payment.subscription_non_expired_different_device_type',
    purchase_not_found: 'payment.purchase_not_found',
    subscription_plan_not_found: 'payment.subscription_plan_not_found',
    subscription_pending:
        'Subscription is in pending state. You will be entitled to the product after confirmation',
    subscription_success: 'Subscription successful',
    subscription_failed: 'payment.subscription_failed',
    in_app_product_not_found: 'payment.in_app_product_not_found',
    subscription_not_found: 'payment.subscription_not_found',
    in_app_product_already_consumed: 'payment.in_app_product_already_consumed',
    in_app_product_pending:
        'Purchase is in pending state. You will be entitled to the product after confirmation',
    purchase_failed: 'payment.purchase_failed',
    purchase_success: 'Purchase successful'
};

const DateExceptionMessages = {
    alreadyPassed: 'date.already_passed'
};

const ReportExceptionMessages = {
    notFound: 'report.not_found',
    alreadyExist: 'report.already_exist',
    unknownError: 'report.unknown_error'
};

const ChatExceptionMessages = {
    notFound: 'chat.not_found',
    alreadyExist: 'chat.already_exist',
    unknownError: 'chat.unknown_error',
    event: {
        notFound: 'chat_event.not_found'
    }
};

const SportExceptionMessages = {
    notFound: 'sport.not_found',
    position: {
        notFound: 'sport.position.not_found'
    }
};

export const ExceptionMessage = {
    user: UserExceptionMessages,
    category: CategoryExceptionMessages,
    common: CommonExceptionMessages,
    media: MediaExceptionMessages,
    notification: NotificationExceptionMessages,
    payment: PaymentExceptionMessages,
    device: DeviceExceptionMessages,
    auth: AuthExceptionMessages,
    date: DateExceptionMessages,
    report: ReportExceptionMessages,
    chat: ChatExceptionMessages,
    sport: SportExceptionMessages
};
