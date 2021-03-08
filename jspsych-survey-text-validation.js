/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-text-validation'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-text-validation',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        default: undefined,
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'Prompt for the subject to response'
          },
          placeholder: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Value',
            default: "",
            description: 'Placeholder text in the textfield.'
          },
          rows: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Rows',
            default: 1,
            description: 'The number of rows for the response text box.'
          },
          columns: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Columns',
            default: 40,
            description: 'The number of columns for the response text box.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Require a response'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          },
          validation: {
            type: jsPsych.plugins.parameterType.FUN,
            pretty_name: 'Validation',
            default: null,
            description: 'Function to be run on this textbox input value after the response is submitted, '+
            'and before the trial ends. The function takes a single argument, the text input value, and should return '+
            'true if the response is valid, and false if the response is not valid. If all responses on the page are '+
            'valid, then the trial will end. If one or more responses is not valid, then the validation_message will be '+
            'shown below the textbox, and the trial will continue waiting until all responses are valid.'
            },
          validation_message: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Validation message',
            default: null,
            description: 'Message to be shown if a validation function is provided and the submitted response is not valid.'
          }
        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to finish the trial.'
      },
      autocomplete: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow autocomplete',
        default: false,
        description: "Setting this to true will enable browser auto-complete or auto-fill for the form."
      },
      show_submit_button: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show submit button',
        default: true,
        description: 'Whether or not to show the submit button. If true, the submit button will be shown. '+
        'If false, the submit button will not be show, so the user must submit responses using the Enter key.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to wait (in ms) before submitting the response. If null, the trial will wait indefinitely '+
        'for the user to submit the response. If not null, the current values of all text boxes will be submitted when '+
        'the trial_duration is reached. If any questions include a validation function, the function(s) will run '+
        'and must return true in order for the trial to end.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var trial_timeout = null;

    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].rows == 'undefined') {
        trial.questions[i].rows = 1;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].columns == 'undefined') {
        trial.questions[i].columns = 40;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].value == 'undefined') {
        trial.questions[i].value = "";
      }
    }

    var html = '';
    // show preamble text
    if(trial.preamble !== null){
      html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';
    }
    // start form
    if (trial.autocomplete) {
      html += '<form id="jspsych-survey-text-form">';
    } else {
      html += '<form id="jspsych-survey-text-form" autocomplete="off">';
    }
    // generate question order
    var question_order = [];
    for(var i=0; i<trial.questions.length; i++){
      question_order.push(i);
    }
    if(trial.randomize_question_order){
      question_order = jsPsych.randomization.shuffle(question_order);
    }

    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      var question_index = question_order[i];
      html += '<div id="jspsych-survey-text-'+question_index+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + question.prompt + '</p>';
      var autofocus = i == 0 ? "autofocus" : "";
      var req = question.required ? "required" : "";
      if(question.rows == 1){
        html += '<input type="text" id="input-'+question_index+'"  name="#jspsych-survey-text-response-' + question_index + '" data-index="'+question_index+'" data-name="'+question.name+'" size="'+question.columns+'" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></input>';
      } else {
        html += '<textarea id="input-'+question_index+'" name="#jspsych-survey-text-response-' + question_index + '" data-index="'+question_index+'" data-name="'+question.name+'" cols="' + question.columns + '" rows="' + question.rows + '" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></textarea>';
      }
      html += '</div>';
    }

    // add submit button
    html += '<input type="submit" id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text" value="'+trial.button_label+'" '
    if (!trial.show_submit_button) {
      html += 'style="visibility:hidden;"';
    }
    html += '></input>';

    html += '</form>'
    display_element.innerHTML = html;

    // add input event listener to check/change validation message on input change
    // NOTE: this needs refactoring - input event listener repeats code from submit event listener
    var qs = display_element.querySelectorAll('input[type="text"]');
    for (var j=0; j<qs.length; j++) {
        if (trial.questions[question_order[j]].validation_message !== null) {
            qs[j].addEventListener('input', function() {
                var ind = parseInt(this.attributes['data-index'].value,10);
                if (trial.questions[question_order[ind]].validation !== null) {
                    var valid_resp = trial.questions[question_order[ind]].validation(this.value);
                    if (!valid_resp) {
                        this.setCustomValidity(trial.questions[question_order[ind]].validation_message);
                        // also add an invalid/error class
                    } else {
                        this.setCustomValidity('');
                        // also remove an invalid/error class
                    }
                }
                display_element.querySelector('#jspsych-survey-text-form').checkValidity();
            });
        }
    }

    // backup in case autofocus doesn't work
    display_element.querySelector('#input-'+question_order[0]).focus();

    display_element.querySelector('#jspsych-survey-text-form').addEventListener('submit', function(e) {
      e.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      
      // show any custom validation messages
      display_element.querySelector('#jspsych-survey-text-form').reportValidity();

      for(var index=0; index < trial.questions.length; index++){
        var id = "Q" + index;
        var q_element = document.querySelector('#jspsych-survey-text-'+index).querySelector('textarea, input'); 
        var val = q_element.value;
        if (trial.questions[question_order[index]].validation !== null) {
            var valid_resp = trial.questions[question_order[index]].validation(val);
            if (!valid_resp) {
                q_element.setCustomValidity(trial.questions[question_order[index]].validation_message);
                // also add an invalid/error class
                // restart the trial duration, if there is one
                if (trial.trial_duration !== null) {
                  jsPsych.pluginAPI.clearAllTimeouts();
                  trial_timeout = jsPsych.pluginAPI.setTimeout(function() {
                    display_element.querySelector('#jspsych-survey-text-form').requestSubmit();
                  }, trial.trial_duration);
                }
                return;
            } else {
                q_element.setCustomValidity('');
                // also remove any error/invalid class here
            }
        }
        var name = q_element.attributes['data-name'].value;
        if(name == ''){
          name = id;
        }        
        var obje = {};
        obje[name] = val;
        Object.assign(question_data, obje);
      }
      // save data
      var trialdata = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      jsPsych.pluginAPI.clearAllTimeouts();

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    });

    var startTime = performance.now();
    if (trial.trial_duration !== null) {
      // turn off automatic form validation, so that we can detect every submit form attempt (and reset the timer if necessary)
      display_element.querySelector('#jspsych-survey-text-form').noValidate = true;
      trial_timeout = jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-survey-text-form').requestSubmit();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
