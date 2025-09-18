import { TemplateLayoutParams } from '../types';

export default ({ header, body }: TemplateLayoutParams): string => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${header}</title>
    <style>
        body, table, td, a {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #333;
            text-decoration: none;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #20B5F2;
            color: #fff;
            padding: 20px;
            text-align: center;
        }

        .body-content {
            padding: 20px;
            background-color: #fffff;
        }

        /* Style links within the body */
        .body-content a {
            color: #20B5F2;
            text-decoration: underline;
        }

        /* Style the button */
        .button {
            display: block;
            width: 200px;
            background-color: #20B5F2;
            color: #ffffff;
            text-align: center;
            padding: 10px 20px;
            margin: 20px auto;
            text-decoration: none;
            border-radius: 5px;
            text: Button;
            text-color:#ffffff;
        }

        /* Style the footer */
        .footer {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${header}</h1>
        </div>
        <div class="body-content">
                ${body}
        </div>
        <div class="footer">
            <p>Best regards, </p>
            <p>LOGO</p>
        </div>
    </div>
</body>
</html>
`;

export const genText = (text): string => `<pre>
${text}
</pre>`;
export const genLink = (link: { title: string; url: string }) => `<p>
<a href="${link.url}" style="color: #20B5F2;">${link.title}</a>
</p>`;
export const genButton = (link: { title: string; url: string }): string =>
    `<a href="${link.url}" class="button">${link.title}</a>`;
