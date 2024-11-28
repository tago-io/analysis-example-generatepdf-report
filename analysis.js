/*
 * Analysis Example
 * Generate pdf report and send via email
 *
 *
 * Instructions
 * To run this analysis you need to add a email and device_token to the environment variables,
 * Go the the analysis, then environment variables,
 * type email on key, and insert your email on value
 * type device_token on key and insert your device token on value
 */

const { Analysis, Device, Services, Utils } = require("@tago-io/sdk");
const dayjs = require("dayjs");

const your_variable = "your_variable"; //enter the variable from your device you would like in the report

// The function myAnalysis will run when you execute your analysis
async function startAnalysis(context) {
  // reads the values from the environment and saves it in the variable envVars
  const envVars = Utils.envToJson(context.environment);

  if (!envVars.email) {
    return context.log("email environment variable not found");
  }
  if (!envVars.device_token) {
    return context.log("device_token environment variable not found");
  }

  const device = new Device({ token: envVars.device_token });

  const data = await device.getData({
    variables: [your_variable],
    start_date: "1 month",
    qty: 10,
  });

  let dataParsed = "variable,value,unit,time";

  data.forEach((x) => {
    dataParsed = `${x.variable},${x.value},${x.unit},${x.time}`;
  });

  const dataArray = dataParsed.split(",");
  const dataVar = dataArray[0];
  const dataVal = dataArray[1];

  const html = `<html>
    <head>
        <style>
            body, html {
                margin: 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            td {
                border: 1px solid black;
                padding: 5px;
                padding-bottom: 25px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
      <table>
        <tr>
            <td colspan="7">Issue date: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}</td>
        </tr>
        <tr>
            <td colspan="4">Start date: 2020-05-20 10:21:32</td>
            <td colspan="3">Stop date: 2020-10-08 22:56:19</td>
        </tr>
        <tr>
            <td colspan="4"> Report of the ${dataVar}</td>
            <td colspan="3">Device Kitchen Oven 5</td>
        </tr>
        <tr>
            <td>Counter</td>
            <td>${dataVar}</td>
            <td>Time</td>
            <td>Date</td>
            <td>Temperature 2</td>
            <td>Time</td>
            <td>Date</td>
        </tr>
        <tr>
          <td>2</td>
          <td>${dataVal}</td>
          <td>10:53:20</td>
          <td>2020-06-10</td>
          <td>137</td>
          <td>10:53:20</td>
          <td>2020-06-10</td>
        </tr>
      </table>
    </body>
  </html>`;

  const options = {
    displayHeaderFooter: true,
    footerTemplate:
      '<div class="page-footer" style="width:100%; text-align:center; font-size:12px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    margin: {
      top: "1.5cm",
      right: "1.5cm",
      left: "1.5cm",
      bottom: "1.5cm",
    },
  };

  const base64 = Buffer.from(html).toString("base64");

  // start the PDF service
  const pdfService = new Services({ token: context.token }).PDF;
  const pdf_base64 = await pdfService.generate({
    base64,
    options,
  });

  // Start the email service
  const emailService = new Services({ token: context.token }).email;

  // Send the email.
  await emailService.send({
    to: envVars.email,
    subject: "Exported File from TagoIO",
    message: "This is an example of a body message",
    attachment: {
      archive: pdf_base64.result,
      type: "base64",
      filename: "exportedfile.pdf",
    },
  });
}

Analysis.use(startAnalysis);

// To run analysis on your machine (external)
// Analysis.use(myAnalysis, { token: "YOUR-TOKEN" });
