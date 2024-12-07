import nodemailer from 'nodemailer'

export const sendMail = async (user_email, otp_code) => {
    const transpoter = nodemailer.createTransport({
        service: 'gmail',
       secure:true,
        port: 465,
        auth: {
            user: 'hafizaiqraaslam1@gmail.com',
            // pass: process.env.NODEMAILER_PASS_KEY
            pass: 'fyft rdfs eprw cktz'
        }
    })

    const info = {
        from: 'hafizaiqraaslam1@gmail.com',
        to: user_email,
        subject: 'Test-1',
        // html:'',
        text: `This is your otp: ${otp_code}`
    }
       
    await transpoter.sendMail(info)
        .then(info => console.log(info.response))
        .catch(error => console.log(error))
}