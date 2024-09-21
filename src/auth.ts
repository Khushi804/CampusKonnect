import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma/prisma';
import { createSendEmailCommand } from '@/lib/ses/createSendEmailCommand';
import EmailProvider from 'next-auth/providers/email';
import { sesClient } from '@/lib/ses/sesClient';
import nodemailer from 'nodemailer';

declare module 'next-auth' {
  interface Session {
    user: { id: string; name: string };
  }
}

// We are splitting the auth configuration into multiple files (`auth.config.ts` and `auth.ts`),
// as some adapters (Prisma) and Node APIs (`stream` module required for sending emails) are
// not supported in the Edge runtime. More info here: https://authjs.dev/guides/upgrade-to-v5

export const {
  auth,
  handlers: { GET, POST },
  signIn,
} = NextAuth({
  ...authConfig,
  secret: process.env.SECRET,
  providers: [
    ...authConfig.providers,
    EmailProvider({
      server: {
        host: 'smtp.gmail.com', // Gmail SMTP server
        port: 465, // SSL port
        auth: {
          user: "223186@theemcoe.org", // Your Gmail address
          pass: process.env.EMAIL_SERVER_PASSWORD, // Your Gmail app password
        },
        secure: true, // SSL for Gmail
      },
      from: 'noreply@norcio.dev', // The email sender address
      maxAge: 24 * 60 * 60, // 24 hours expiration for the email link
      async sendVerificationRequest({ identifier: email, url, provider }) {
        // Use nodemailer to send the email
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // Use SSL
          auth: {
            user: "223186@theemcoe.org",
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        const message = {
          to: email,
          from: provider.from,
          subject: 'Login To CampusKonnect',
          html: `<body>
            <table width="100%" border="0" cellspacing="20" cellpadding="0"
              style=" max-width: 600px; margin: auto; border-radius: 10px;">
              <tr>
                <td align="center"
                  style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif;">
                  Login to <strong>CampusKonnect</strong>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="border-radius: 5px;" bgcolor="purple"><a href="${url}"
                          target="_blank"
                          style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: black; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block; font-weight: bold;">Login</a></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center"
                  style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif;">
                  If you did not request this email you can safely ignore it.
                </td>
              </tr>
            </table>
          </body>`,
        };

        await transporter.sendMail(message); // Send the email
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt', // Using JWT session strategy
  },
  callbacks: {
    ...authConfig.callbacks,
    session({ token, user, ...rest }) {
      return {
        user: {
          id: token.sub!, // Ensure the user ID is passed in the session
        },
        expires: rest.session.expires, // Session expiration handling
      };
    },
  },
});

// export const {
//   auth,
//   handlers: { GET, POST },
//   signIn,
// } = NextAuth({
//   ...authConfig,
//   secret: process.env.SECRET,
//   providers: [
//     ...authConfig.providers,
//     {
//       // There's currently an issue with NextAuth that requires all these properties to be specified
//       // even if we really only need the `sendVerificationRequest`: https://github.com/nextauthjs/next-auth/issues/8125
//       id: 'email',
//       type: 'email',
//       name: 'Email',
//       from: 'noreply@norcio.dev',
//       server: {
//         host: 'smtp.gmail.com',
//         port: 465, // Port 465 for SSL
//         auth: {
//             user: "223186@theemcoe.org",
//             pass: process.env.EMAIL_SERVER_PASSWORD
//         }
//       },
//       maxAge: 24 * 60 * 60,
//       options: {},
//       async sendVerificationRequest({ identifier: email, url }) {
//         const sendEmailCommand = createSendEmailCommand(
//           email,
//           'noreply@norcio.dev',
//           'Login To CampusKonnect',
//           `<body>
//   <table width="100%" border="0" cellspacing="20" cellpadding="0"
//     style=" max-width: 600px; margin: auto; border-radius: 10px;">
//     <tr>
//       <td align="center"
//         style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif;">
//         Login to <strong>CampusKonnect</strong>
//       </td>
//     </tr>
//     <tr>
//       <td align="center" style="padding: 20px 0;">
//         <table border="0" cellspacing="0" cellpadding="0">
//           <tr>
//             <td align="center" style="border-radius: 5px;" bgcolor="purple"><a href="${url}"
//                 target="_blank"
//                 style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: black; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block;//  font-weight: bold;">Login</a></td>
//           </tr>
//         </table>
//       </td>
//     </tr>
//     <tr>
//       <td align="center"
//         style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif;">
//         If you did not request this email you can safely ignore it.
//       </td>
//     </tr>
//   </table>
// </body>`,
//         );
//         await sesClient.send(sendEmailCommand);
//       },
//     },
//   ],
//   adapter: PrismaAdapter(prisma),
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     ...authConfig.callbacks,
//     session({ token, user, ...rest }) {
//       return {
//         /**
//          * We need to explicitly return the `id` here to make it available to the client
//          * when calling `useSession()` as NextAuth does not include the user's id.
//          *
//          * If you only need to get the `id` of the user in the client, use NextAuth's
//          * `useSession()`, but if you need more of user's data, use the `useSessionUserData()`
//          * custom hook instead.
//          */
//         user: {
//           id: token.sub!,
//         },
//         expires: rest.session.expires,
//       };
//     },
//   },
// });
//
