const nodemailer = require("nodemailer");

exports.mailer = async function sendMail(
  subject = "From Thuancutee (:",
  receivers = "",
  mailContent = "Default content"
) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    to: receivers,
    subject,
    text: mailContent,
    html: `<div>${mailContent}</div>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
