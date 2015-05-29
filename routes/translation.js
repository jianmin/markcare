/*
 * @(#)translation.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/25
 * Descrption: The translation module. 
 */

exports.init = function(router) {

  router.route('/translation').get(function(req, res) {
    var doc = {
      success: true,
      message: 'OK',
      user: {
        id: req.session.id,
        email: req.session.email,
        full_name: req.session.full_name,
        role: req.session.role
      },
      ui: {
        app_logo: res.__('app_logo'),
        app_name: res.__('app_name'),
        app_copyright: res.__('app_copyright'),

        button_refresh: res.__('button_refresh'),
        button_submit: res.__('button_submit'),
        button_ok: res.__('button_ok'),
        button_cancel: res.__('button_cancel'),
        button_close: res.__('button_close'),
        button_apply: res.__('button_apply'),
        button_save: res.__('button_save'),
        button_edit: res.__('button_edit'),
        button_delete: res.__('button_delete'),
        button_upload: res.__('button_upload'),
        button_search: res.__('button_search'),

        settings: res.__('settings'),
        not_authorized: res.__('not_authorized'),
        user_not_found: res.__('user_not_found'),
        empty_field: res.__('empty_field'),
        mandatory_field: res.__('mandatory_field'),
        integer_field: res.__('integer_field'),
        choose_option: res.__('choose_option'),

        tab_patients: res.__('tab_patients'),
        tab_help: res.__('tab_help'),

        menu_add_patient: res.__('menu_add_patient'),
        menu_search_patients: res.__('menu_search_patients'),
        menu_about: res.__('menu_about'),

        add_patient: res.__('add_patient'),
        edit_patient: res.__('edit_patient'),

        patient_exists: res.__('patient_exists'),
        patient_not_found: res.__('patient_not_found'),
        patient_added: res.__('patient_added'),
        failed_to_add_patient: res.__('failed_to_add_patient'),
        patient_deleted: res.__('patient_deleted'),
        failed_to_delete_patient: res.__('failed_to_delete_patient'),

        clear_sorting: res.__('clear_sorting'),
        clear_filter: res.__('clear_filter'),

        first_name: res.__('first_name'),
        last_name: res.__('last_name'),
        ssn: res.__('ssn'),
        gender: res.__('gender'),
        age: res.__('age'),
        dob: res.__('dob'),
        address: res.__('address'),
        notes: res.__('notes'),

        file_name: res.__('file_name'),
        file_size: res.__('file_size'),
        upload_test_results: res.__('upload_test_results'),
        download_file: res.__('download_file'),
        delete_file: res.__('delete_file'),
        select_file: res.__('select_file'),
        no_file_chosen: res.__('no_file_chosen'),
        please_select_file: res.__('please_select_file'),
        file_size_limit: res.__('file_size_limit')
      }
    };

    res.json(doc);
  });

};
