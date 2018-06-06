const Analysis = require('tago/analysis');
const Utils    = require('tago/utils');
const Device   = require('tago/device');

// To run this analysis you need to add a device token to the environment variables,
// To do that, go to your device, then token and copy your token.
// Go the the analysis, then environment variables, 
// add a new one and type device_token on key, and paste your token on value

// This analysis reads the minimum, maximum and average value of the variable "temperature"
// then the analysis then saves this values in a new variable

// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context) {
  // reads the values from the environment and saves it in the variable env_vars
  const env_vars = Utils.env_to_obj(context.environment);

  const device = new Device(env_vars.device_token);
  // This is a filter to get the minimum value of the variable temperature in the last day
  const minFilter = {
    variable: 'temperature',
    query: 'min',
    start_date: '1 day',
  };

  // Now we use the filter for the device to get the data
  // check if the variable min has any value
  // if so, we crete a new object to send to Tago
  const [min] = await device.find(minFilter);
  if (min) {
    const minValue = {
      variable: 'temperature_minimum',
      value: min.value,
      unit: 'F',
    };
  
    // now we insert the new object with the minimum value
    await device.insert(minValue).then(context.log('Temperature Minimum Updated'));
  } else {
    context.log('Minimum value not found');
  }

  // This is a filter to get the maximum value of the variable temperature in the last day
  const maxFilter = {
    variable: 'temperature',
    query: 'max',
    start_date: '1 day',
  };

  const [max] = await device.find(maxFilter);
  if (max) {
    const maxValue = {
        'variable': 'temperature_maximum',
        'value': max.value,
        'unit': 'F',
    };
    await device.insert(maxValue).then(context.log('Temperature Maximum Updated'));
  } else {
    context.log('Maximum value not found');
  }

  // This is a filter to get the last 1000 values of the variable temperature in the last day
  const avgFilter = {
    variable: 'temperature',
    qty: 1000,
    start_date: '1 day',
  };

  const avg = await device.find(avgFilter);
  if (avg.length) {
    let temperatureSum = avg.reduce((previewsValue, currentValue) => {
      return previewsValue + Number(currentValue.value);
    }, 0);
  
    temperatureSum = temperatureSum / avg.length;
  
    const avgValue = {
      'variable': 'temperature_average',
      'value': temperatureSum,
      'unit': 'F',
    };
    await device.insert(avgValue).then(context.log('Temperature Average Updated'));
  } else {
    context.log('No result found for the avg calculation');
  }
}

module.exports = new Analysis(myAnalysis, 'MY-ANALYSIS-TOKEN-HERE');
