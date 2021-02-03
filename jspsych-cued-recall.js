/**
 * jspsych-recall
 * Becky Gilbert
 *
 * Plugin for cued text recall and checking/displaying participants answers
 *
 **/

jsPsych.plugins['cued-recall'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'cued-recall',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The stimulus to be displayed for cueing the text response. Blanks are indicated by %% signs and '+
                'automatically replaced by input fields. If there is a correct answer you want the system to check against, '+
                'it must be typed between the two percentage signs (i.e. %solution%).'
            },
            text_box_location: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Text box location',
                default: 'below',
                choices: ['below','stimulus'],
                description: 'Location for the text response box: either "below" or "stimulus". If "below" (the default), '+
                'the text box is positioned below the stimulus text, '+
                'and the %% in the stimulus text will be replaced with underscores (_) indicating the to-be-filled-in text. '+
                'If "stimulus", the text response box is embedded in the stimulus text in place of the %%.'
            },
            text_box_rows: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box rows',
                default: 1,
                description: 'Number of columns for the text response box(es).'
            },
            text_box_columns: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box columns',
                default: 40,
                description: 'Number of columns for the text response box(es).'
            },
            text_box_justify: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Text box justify',
                default: 'center',
                choices: ['center','centre','left','right'],
                description: 'Text justification for the text response box: either "center"/"centre" (default), "left", or "right".'
            },
            text_box_font_size: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box font size',
                default: 18,
                description: 'Font size (in px) to use for the text response box(es).'
            },
            text_box_padding_top: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding top',
                default: 8,
                description: 'Padding (in px) between text and top of response box(es).'
            },
            text_box_padding_bottom: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding bottom',
                default: 8,
                description: 'Padding (in px) between text and bottom of response box(es).'
            },
            text_box_padding_left: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding left',
                default: 4,
                description: 'Padding (in px) between text and left side of response box(es).'
            },
            text_box_padding_right: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding right',
                default: 4,
                description: 'Padding (in px) between text and right side of response box(es).'
            },
            blank_text_length: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Blank text length',
                default: 10,
                description: 'If text_box_location is "below", then blank_text_length is the number of underscores (_) '+
                'that will be entered into the stimulus text in place of the %%. Default is 10.'
            },
            show_submit_button: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Show submit button',
                default: true,
                description: 'Whether or not to show a submit button on the screen that the participant can click to end the trial. '+
                'If false, then the trial should end either with a key press (allow_submit_key is true) or by timing out (trial_duration is not null).'
            },
            submit_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Submit',
                description: 'Button label for submitting a response, only used when show_submit_button is true.'
            },
            allow_submit_key: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Allow submit key',
                default: false,
                description: 'Whether or not to allow a specific key press (e.g. enter) to end the trial. '+
                'Note that this key should be *different* from the one used to print a response (print_response_key) '+
                'if responses are printed to the screen (print_responses is true).'
            },
            submit_key: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Submit key',
                default: 'enter',
                description: 'Which key can be used to end the trial, if allowed (i.e. allow_submit_key is true).'
            },
            print_responses: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Print responses',
                default: false,
                description: 'Whether or not to allow multiple responses, and print each one to the screen using '+
                'a specific key press (e.g. enter). If true, multiple responses will be recorded until the trial ends via '+
                'a sumbit_key keypress or trial_duration is reached.'
            },
            print_response_key: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Submit key',
                default: 'enter',
                description: 'Which key can be used to print the response to the screen, if allowed (i.e. print_responses is true). '+
                'Note that this key should be *different* from the one used to end the trial (submit_key) if a key is allowed to end the '+
                'trial (allow_submit_key is true).'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: '',
                description: 'HTML-formatted string to be displayed above the stimulus. This can be used to provide a reminder about instructions, '+
                'and can include any HTML markup, such as images, audio, etc.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to wait (in ms) before ending the trial. If no response is made before this timer is reached, the response will be recorded as null '+
                'and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely, '+
                'so the participant should be allowed to end the trial with a submit button (show_submit_button: true) and/or key press: (allow_submit_key: true).'
            },
            check_answers: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Check answers',
                default: false,
                description: 'Boolean value indicating if the answers given by participants should be compared against a '+
                'correct solution given in the stimulus text (between %% signs) after the button was clicked.'
            },
            mistake_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Mistake function',
                default: function (resp) {},
                description: 'Function called if check_answers is true and there is a difference between the '+
                'participants answer and the correct solution in the stimulus text (between %% signs). The participants response '+
                'string is automatically passed to this function.'
            }
        }
    };

    plugin.trial = function (display_element, trial) {

        // check parameter values
        if (!['center','centre','left','right'].includes(trial.text_box_justify)) {
            console.error('Error in jspsych-cued-recall plugin: please enter a valid option for text_box_justify, either "center/centre", "right", or "left".');
        }
        if (trial.text_box_justify == "centre") {
            trial.text_box_justify = "center";
        }
        if (trial.show_submit_button == false && trial.allow_submit_key == false && trial.trial_duration == null) {
            console.warn("Warning in jspsych-cued-recall plugin: the trial may be deadlocked. Please provide a way for the trial to end "+
            "via 'show_submit_button: true', 'allow_submit_key: true', and/or providing a time limit with 'trial_duration'.")
        }

        var elements = trial.stimulus.split('%');
        var solutions = [];
        var answers = [];
        var answers_correct = true;

        // create HTML string
        var html = '<div class="jspsych-cued-recall-container">';
        if (trial.prompt !== "") {
            html += trial.prompt;
        }
        html += '<div class="jspsych-cued-recall-stimulus-container">';
        for (var i=0; i<elements.length; i++) {
            if (i%2 === 0) {
                html += elements[i];
            } else {
                solutions.push(elements[i].trim());
                if (trial.text_box_location == "below") {
                    var blank = Array(trial.blank_text_length).join("&nbsp;");
                    html += '<u>'+blank+'</u>';
                } else if (trial.text_box_location == "stimulus") {
                    html += '<input type="text" class="jspsych-cued-recall-response" id="jspsych-cued-recall-response-'+(solutions.length-1)+'" '+
                    'value="" size="'+trial.text_box_columns+'" '+
                    'style="font-size:'+trial.text_box_font_size+'px; '+
                    'padding-top:'+trial.text_box_padding_top+'px; padding-bottom:'+trial.text_box_padding_bottom+'px; '+
                    'padding-right:'+trial.text_box_padding_right+'px; padding-left:'+trial.text_box_padding_left+'px; '+
                    'text-align:'+trial.text_box_justify+'">';
                } else {
                    console.error('Error in jspsych-cued-recall plugin: please enter a valid option for text_box_location, either "below" or "stimulus".')
                }
            }
        }

        if (trial.text_box_location == "below") {
            html += '<input type="text" class="jspsych-cued-recall-response" id="jspsych-cued-recall-response-0" '+
            'value="" size="'+trial.text_box_columns+'" '+
            'style="font-size:'+trial.text_box_font_size+'px; '+
            'padding-top:'+trial.text_box_padding_top+'px; padding-bottom:'+trial.text_box_padding_bottom+'px; '+
            'padding-right:'+trial.text_box_padding_right+'px; padding-left:'+trial.text_box_padding_left+'px; '+
            'text-align:'+trial.text_box_justify+'">';
        }
        html += '</div>';

        // add submit button HTML
        if (trial.show_submit_button) {
            html += '<div id="jspsych-cued-recall-btn-container" style="margin-top:20px";><button class="jspsych-btn" type="button" id="jspsych-cued-recall-submit">'+
            trial.submit_button_label+'</button></div>';
        }
        html += '</div>';

        display_element.innerHTML = html;

        if (trial.allow_submit_key) {
            jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: check_responses,
                valid_responses: [trial.submit_key],
                rt_method: 'performance',
                allow_held_key: false,
                persist: true
            });
        }

        if (trial.print_responses) {
            jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: print_response,
                valid_responses: [trial.print_response_key],
                rt_method: 'performance',
                allow_held_key: false,
                persist: true
            });
        }

        function print_response() {
            var resp_time = performance.now() - response_start_time;
            var current_response = document.getElementById('jspsych-cued-recall-response-0').value.trim();
            var resp = {response: current_response, rt: resp_time};
            answers.push(resp);
            display_element.innerHTML += current_response+'<br/>';
            document.getElementById('jspsych-cued-recall-response-0').focus();
            response_start_time = performance.now();
        }
                
        function check_responses() {
            for (var i=0; i<solutions.length; i++) {
                var resp_time = performance.now() - response_start_time;
                var field = document.getElementById('jspsych-cued-recall-response-'+i)
                var current_response = field.value.trim();
                var resp = {response: current_response, rt: resp_time};
                answers.push(resp);
                if (trial.check_answers) {
                    if (current_response !== solutions[i]) {
                        field.style.color = 'red';
                        answers_correct = false;
                    } else {
                        field.style.color = 'black';
                    }
                }
            }
            if (!trial.check_answers || (trial.check_answers && answers_correct)) {
                end_trial();
            } else {
                response_start_time = performance.now(); // get a new start time, in case we want to record an RT starting from when the mistake fn is called
                trial.mistake_fn(current_response);
                answers_correct = true;
            }  
        };

        function end_trial() {
            // gather responses and RTs
            var trial_duration = performance.now() - start_time;
            var trial_data = {
                'trial_duration': trial_duration,
                'answers': JSON.stringify(answers)
            };
            // clear any timers
            jsPsych.pluginAPI.clearAllTimeouts();
            // clear any keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            // clear display
            display_element.innerHTML = '';
            // end
            jsPsych.finishTrial(trial_data);
        }
        
        // add submit button click event listener
        if (trial.show_submit_button) {
            display_element.querySelector('#jspsych-cued-recall-submit').addEventListener('click', check_responses);
        }

        // put cursor in first response box
        document.querySelector('#jspsych-cued-recall-response-0').focus();

        var start_time = performance.now();
        var response_start_time = performance.now();

        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(check_responses, trial.trial_duration);
        }
    };

    return plugin;
})();
