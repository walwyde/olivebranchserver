const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = (options, callback) => {
  transporter.sendMail(options, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(data);
    }
  });
};

exports.mailTemplate = (passwordToken) => {
  return `<!DOCTYPE html>
        <html lang="en">
          <body>
            <style>
              div {
                padding: 20px;
                color: #333;
              }
              .jumbotron {
                background: #ddd;
                padding: 20px;
                border-radius: 5px;
              }
              h1 {
                text-align: center;
              }
              p {
                text-align: center;
                font-size: 18px;
              }
              a {
                display: block;
                text-align: center;
                padding: 10px;
                background: #333;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                cursor: pointer;
                margin: 0 auto;
                transition: all 0.5s;
        
              }
              a:hover {
                background: #555;
                color: #fff;
                font-size: 12px;
                width: 70%;
              }
            </style>
            <div>
              <div class="jumbotron">
                <h1>OliveBranch</h1>
                <p>Reset Password</p>
              </div>
              <p>
                You requested to reset your password, if this was you follow this link
                to reset your password, else just ignore.
              </p>
              <a
                target="_blank"
                href="http://localhost:3000/reset-password/${passwordToken}"
                >Click to Reset Password</a
              >
            </div>
          </body>
        </html>
        `;
};
