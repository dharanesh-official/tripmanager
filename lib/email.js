import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    try {
        // Log to console for development/fallback
        console.log(`\n=== EMAIL SIMULATION ===\nTo: ${to}\nSubject: ${subject}\nContent: \n${html}\n========================\n`);

        const user = process.env.SMTP_USER || process.env.EMAIL_USER;
        const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

        // Try to send real email if credentials exist
        if (user && pass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail', // or configured host
                auth: {
                    user,
                    pass,
                },
            });

            await transporter.sendMail({
                from: '"Tripplanner_by_KD" <no-reply@tripplannerbykd.com>',
                to,
                subject,
                html,
            });
        }
        return true;
    } catch (error) {
        console.error('Email sending failed (fallback to console was successful):', error);
        return false; // Return false but we consider console log as success for dev
    }
};
