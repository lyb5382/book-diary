const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, match: [EMAIL_REGEX, '유효 이메일'], unique: true },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAttemp: { type: Date, default: 0 },
    failedLoginAttemp: { type: Number, default: 0 }
})

userSchema.methods.comparePasswd = function (p) {
    return bcrypt.compare(p, this.passwordHash)
}

userSchema.methods.setPassword = async function (plain) {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(plain, salt)
}

userSchema.methods.safeJSON = function () {
    const obj = this.toObject({ versionKey: false })
    delete obj.passwordHash
    return obj
}

userSchema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret.passwordHash
        return ret
    }
})

module.exports = mongoose.model('User', userSchema)