/* 
 * Analysis Example
 * Generate pdf report and send via email
 * 
 * 
 * Instructions
 * To run this analysis you need to add a email to the environment variables,
 * Go the the analysis, then environment variables, 
 * type email on key, and insert your email on value
*/

const Analysis = require('tago/analysis');
const Utils    = require('tago/utils');
const Service  = require('tago/services');
const axios    = require('axios');
const moment   = require('moment-timezone');

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
              <td colspan="7">Issue date: ${moment().format('YYYY-MM-DD HH:mm:ss')}</td>
          </tr>
          <tr>
              <td colspan="4">Start date: 2020-05-20 10:21:32</td>
              <td colspan="3">Stop date: 2020-10-08 22:56:19</td>
          </tr>
          <tr>
              <td colspan="4"> Report of the temperature</td>
              <td colspan="3">Device Kitchen Oven 5</td>
          </tr>
          <tr>
              <td>Counter</td>
              <td>Temperature 1</td>
              <td>Time</td>
              <td>Date</td>
              <td>Temperature 2</td>
              <td>Time</td>
              <td>Date</td>
          </tr>

          <tr>
          <td>2</td>
          <td>120</td>
          <td>10:53:20</td>
          <td>2020-06-10</td>
          <td>137</td>
          <td>10:53:20</td>
          <td>2020-06-10</td>
        </tr>

    </tr>
      </table>
  </body>
</html>`;

// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context) {
  // reads the values from the environment and saves it in the variable env_vars
  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.email) return context.log('email environment variable not found');

  const options = {
    displayHeaderFooter: true,
    footerTemplate: '<div class="page-footer" style="width:100%; text-align:center; font-size:12px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    margin: {
      top: '1.5cm',
      right: '1.5cm',
      left: '1.5cm',
      bottom: '1.5cm',
    },
  };
  const result = await axios.post('https://pdf.tago.io', { base64: Buffer.from(html).toString('base64'), options }).catch(context.log);
  const pdf = result.data.result;

  // Start the email service
  const email = new Service(context.token).email;

  // Pass to .send function the email addres, subject, body_msg, from and attachment.
  // See the docs to know what is optional.
  const email_address = env_vars.email;
  const subject       = 'Exported File from Tago';
  const body_msg      = 'This is an example of a body message';
  const from          = 'tago@tago.io';
  const attachment    = {
    archive: pdf,
    type: 'base64',
    filename: 'exportedfile.pdf',
  };

  // Send the email.
  await email.send(email_address, subject, body_msg, from, attachment).then(context.log);
}

// The analysis token in only necessary to run the analysis outside Tago
module.exports = new Analysis(myAnalysis, 'if-run-external-insert-the-analysis-token-here');
