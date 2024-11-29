const nodemailer = require("nodemailer")

console.log()

const sendEmail = async (userEmail, sub, msg) => {
    const transport = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        sender: true,
        secure: true,
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.APP_PASS
        },
        socketTimeout: 60000,
    })
    try {
        console.log(userEmail)
        const info = await transport.sendMail({
            from: `"EJUUZ"<${process.env.EMAIL_ID}>`,
            to: userEmail,
            subject: sub,
            html: msg
        })
        console.log("Msg send: ", info.messageId)
        return true
    } catch (error) {
        console.log(error)
        return false;
    }
}

module.exports = sendEmail