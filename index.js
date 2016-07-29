'use strict';
const Analysis = require('tago/analysis');
const Utils    = require('tago/utils');
const Device   = require('tago/device');
/**
 * The follow function is our main function, that will call ãll others.
 * The function presumes that you have a enviroment variable, that can be set in the admin website, in the Analysis configuration:
 * -> device_token: token
 * @param  {object} context automatic received from Tago
 */
function run_analysis(context) {
    //Convert the environment variables into an object.
    //You can do this by yourself, we just added an easily way.
    const env_vars  = Utils.env_to_obj(context.environment);

    const my_device = new Device(env_vars.device_token);

    my_device.find({"variable":"temperature", "query":"min", "start_date":"1 day"}).then((result_array) => {
        if (!result_array[0]) return context.log('No result for minimum calculation');

        //The API will always return an array of results.
        //But, when using a "query" parameter, it will always return an array with only one result.
        //So, we have no need to check for multiple values.
        const obj_to_save = {
            "variable": "temperature_minimum",
            "value": result_array[0].value,
            "unit": "F"
        };

        my_device.insert(obj_to_save);

    }).catch(error => context.log(error)); //Just another way to get the error. Do exatcly same thing than the other above.

    my_device.find({"variable":"temperature", "query":"max", "start_date":"1 day"}).then((result_array) => {
        if (!result_array[0]) return context.log('No result for maximum calculation');
        const obj_to_save = {
            "variable": "temperature_maximum",
            "value": result_array[0].value,
            "unit": "F"
        };
        my_device.insert(obj_to_save);

    }).catch(context.log); //Pass context.log, it will print the error in the console so we can know that something is wrong.

    my_device.find({"variable":"temperature", "qty": 1000, "start_date":"1 day"}).then((result_array) => {
        if (!result_array[0]) return context.log('No result for avg calculation');

        //In this case, we are looking for, at maximum, 1.000 values, to get the avg temperature.
        //I'm just presuming that you will have less than 1.000 records in the last day
        //Remember that API only let you get 10.000 records by request.
        let temperature_sum = result_array.reduce((final_value, current_obj) => {
            return final_value + Number(current_obj.value);
        }, 0);

        temperature_sum = temperature_sum / result_array.length;

        const obj_to_save = {
            "variable": "temperature_average",
            "value": temperature_sum,
            "unit": "F"
        };
        my_device.insert(obj_to_save);
    }).catch(context.log);


}

module.exports = new Analysis(run_analysis, 'MY-ANALYSIS-TOKEN-HERE');