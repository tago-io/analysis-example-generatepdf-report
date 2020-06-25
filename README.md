## What this does
Generate a pdf file to send via email.


## How to run the script on Tago
Do your own modifications and add variable data from a device in your report.<br>
Upload to Tago analysis, in the admin website.<br>
Add the environment variable `email` with an email.
Add the environment variable `device_token` with the device token of the device you would like to include in your report and the variable to be on line 21.


## How to run the script from my computer
Make sure you have npm and node installed in your machine.<br>
Add the environment variable `email` with a email.<br>
Add the environment variable `device_token` with the device token of the device you would like to include in your report and the variable to be added where designated in the script.
Open the analysis.js, change `MY-ANALYSIS-TOKEN-HERE` line for your analysis token.<br>
Open the terminal and run:
 

`npm install`<br>
`node .`
