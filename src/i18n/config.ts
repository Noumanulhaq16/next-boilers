export const TranslatorModuleOptions = {
    defaultLang: 'en',
    global: true,
    requestKeyExtractor: (req) => {
        return req.headers['locale'];
    },
    translationSource: '/dist/i18n'
};
