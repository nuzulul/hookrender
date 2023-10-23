'use strict'

exports.EVENTS = {
    PREAUTHENTICATED: "preauthenticated",
    AUTHENTICATED: "authenticated",
    AUTHENTICATION_FAILURE: 'auth_failure',
}

exports.STATUS = {
    
    PREAUTHENTICATED: "preauthenticated",
    AUTHENTICATED: "authenticated",
    UNAUTHENTICATED: "unauthenticated",
}

exports.URLS = {
    BASE: "https://www.instagram.com/",
    LOGIN: "https://www.instagram.com/accounts/login/",
    LOGIN_API: "https://www.instagram.com/api/v1/web/accounts/login/ajax/",
    PROFILE_API: "https://www.instagram.com/api/v1/users/web_profile_info/",
    SIDECAR: "https://www.instagram.com/api/v1/media/configure_sidecar/"
}

exports.DEFAULT_PUPPETEER_OPTIONS = {
    headless: true,
    defaultViewport: null,
}

exports.DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61";

exports.ALLOWED_MEDIA_EXTENSIONS = [
    "jpeg",
    "png",
    "heic",
    "heif",
    "mp4",
    "mov",
    "qt"
]

exports.ALLOWED_MEDIA_MIMETYPES = [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "video/mp4",
    "video/quicktime"
]

exports.CROP_SIZES = {
    ORIGINAL: "original",
    SQUARE: "1:1",
    PORTRAIT: "4:5",
    LANDSCAPE: "16:9",
}

exports.MAX_FEED_VIDEO_DURATION_IN_SECONDS = 60;