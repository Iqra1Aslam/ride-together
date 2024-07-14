import nodemailer from 'nodemailer'

export const sendMail = async (user_email, otp_code) => {
    const transpoter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        auth: {
            user: 'manaal2fatima@gmail.com',

            pass: 'msyh zwfd xrar yfzh' 
        }
    })

    const info = {
        from: 'manaal2fatima@gmail.com',
        to: user_email,
        subject: 'Test-1',
        // html:'',
        text: `this is your otp: ${otp_code}`
    }

    await transpoter.sendMail(info)
        .then(info => console.log(info.response))
        .catch(error => console.log(error))
}