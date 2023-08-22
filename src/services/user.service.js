const userModel = require('../models/user.model');
const blockedUserModel = require('../models/blocked-user.model');

const axios = require('axios');
const generateCode = require("../utils/generate-code");
const hashedPassword = require('../utils/hash-password')

const register = async (req, res, body) => {
    try {
        const { phone, password, fullName } = body;

        const user = await userModel.findOne({ phone: phone });

        if (user) {
            req.flash('error', 'User already exists');
            return res.redirect('/register');
        }

        req.session.user = {
            password: password,
            fullName: fullName,
            phone: phone
        }
        await sendPhoneCode(req, res, phone);
    } catch (error) {
        console.log(error);
    }
}

const sendPhoneCode = async (req, res, phone) => {
    const baseUrl = process.env.ESKIZ_BASE_API_URL;
    const api = `${baseUrl}message/sms/send`
    try {
        const code = generateCode();
        const token = await createToken();
        const data = {
            mobile_phone: phone,
            message: 'Your verification code is: ' + code,
            from: '4546',
        }

        const blockedUser = await blockedUserModel.findOne({ phone: phone });
        if (blockedUser) {
            req.flash('error', 'Allready blocked');
            return res.redirect('/register');
        }

        await blockedUserModel.create({
            phone: phone,
            code
        });

        const headers = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        const response = await axios.post(api, data, headers);

        if (response.data.status !== 'waiting') {
            req.flash('error', 'not sms sent');
            res.redirect('/register');
            return;
        }

        res.redirect(`/verify`)
    } catch (error) {
        console.log(error);
    }
}

const verify = async (req, res, body) => {
    try {
        const { code } = body;
        const phone = req.session.user.phone

        const blockedUser = await blockedUserModel.findOne({ phone: phone });
        let count = 0 || req.session.count;

        if (blockedUser.code !== code) {
            count++;
            req.session.count = count;
            req.flash('error', 'Invalid code');
            if (Number(req.session.count) > 4) {
                await blockedUserModel.findOneAndDelete({ phone });
                req.flash('error', 'Too many attempts');
                return res.redirect(`/register`);
            }
            return res.redirect(`/verify`);
        }

        const user = req.session.user;
        const hashPassword = await hashedPassword(user.password);
        await userModel.create({
            phone,
            password: hashPassword,
            fullName: user.fullName
        })

        await blockedUserModel.findOneAndDelete({ phone });
        req.session.user = null;
        req.session.destroy();

        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }
}

const createToken = async () => {
    const baseUrl = process.env.ESKIZ_BASE_API_URL;
    const api = `${baseUrl}auth/login`;
    const ESKIZ_EMAIL = process.env.ESKIZ_EMAIL;
    const ESKIZ_SECRET_PASSWORD = process.env.ESKIZ_SECRET_PASSWORD;
    try {
        const body = { email: ESKIZ_EMAIL, password: ESKIZ_SECRET_PASSWORD };
        const { data } = await axios.post(api, body);

        return data.data.token;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    register,
    sendPhoneCode,
    verify
}