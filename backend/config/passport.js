require('dotenv').config()
const passport = require('passport')
const kakaoStrategy = require('passport-kakao').Strategy
const User = require('../models/User')

passport.use(new kakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackURL: process.env.KAKAO_CALLBACK_URL
}, async (profile, done) => {
    try {
        const kakaoId = profile.id;
        const kakaoAccount = profile._json?.kakao_account || {}
        const profileInfo = kakaoAccount.profile || {}
        const email = kakaoAccount.email
        const nickname = profileInfo.nickname
        let user = null
        user = await User.findOne({ kakaoId })
        if (!user && email) {
            user = await User.findOne({ email: email.toLowerCase() })
            if (user) {
                user.kakaoId = kakaoId
                user.provider = "kakao"
                if (!user.displayName) user.displayName = nickname || user.email;
                if (!user.avatarUrl && profileInfo.profile_image_url) {
                    user.avatarUrl = profileInfo.profile_image_url;
                }
                user.isActive = true
                await user.save()
            }
        }
        if (!user) {
            user = await User.create({
                kakaoId,
                provider: "kakao",
                email: email || undefined,
                displayName: nickname || "카카오유저",
                avatarUrl: profileInfo.profile_image_url || "",
                isActive: true,
            })
        }
        return done(null, user)
    } catch (err) {
        console.error("KakaoStrategy error:", err)
        return done(err)
    }
}))

module.exports = passport